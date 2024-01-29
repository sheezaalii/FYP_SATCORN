from rest_framework.views import APIView  # type: ignore
from rest_framework import status
from sklearn.discriminant_analysis import StandardScaler # type: ignore
from .serializers import UserSerializer, VerifyOTPSerializer
# , FieldSerializer
from rest_framework.response import Response #type: ignore
from .models import User, Farm, Season, Field, CropRotation, Job
# , Field
from rest_framework.exceptions import AuthenticationFailed, NotFound # type: ignore
import jwt, datetime # type: ignore
from .email import send_opt_via_email
import ee # type : ignore
from django.http import HttpResponse # type: ignore
from .serializers import FarmSerializer, SeasonSerializer, FieldSerializer, CropRotationSerializer, JobSerializer
from django.shortcuts import get_object_or_404
from tensorflow.keras.models import load_model # type: ignore
import joblib
import os
import numpy as np


# Register User 
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        existing_user = User.objects.filter(email=email).first()

        # Check if the user with the provided email already exists and is not verified
        if existing_user and not existing_user.is_verified:
            existing_user.delete()  # Delete the existing user
        
        
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.is_valid():
            serializer.save()
            
            # Send Email to use
            send_opt_via_email(serializer.data['email'])
            return Response({
                'status': 200,
                'message': 'User created successfully please check your email for otp',
                'data': serializer.data
            })
        
        return Response(serializer.data)
    
# Verify OTP
class VerifyOTPView(APIView):
   def post(self, request):
    try:
        data = request.data
        serializer = VerifyOTPSerializer(data=data)
        
        if serializer.is_valid():
            user_email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            user = User.objects.filter(email=user_email).first()  # Use .first() to get the first matching user
            
            if user.is_verified:
                return Response({
                    'status': 400,
                    'message': 'User is already verified',
                })
                
            if user.otp == otp:
                user.is_verified = True
                user.otp = ''
                user.save()
                return Response({
                    'status': 200,
                    'message': 'User verified successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': 400,
                    'message': 'Incorrect OTP',
                    'data': serializer.data
                })
        else:
            return Response({
                'status': 400,
                'message': 'Incorrect email',
                'data': serializer.data
            })

    except Exception as e:
        return Response({
            'status': 400,
            'message': 'Incorrect OTP',
            'data': serializer.data
        })

        
    

# Login User
class loginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = User.objects.filter(email=email).first()
        if user is None:
            raise AuthenticationFailed('User not found')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password')
        
        if not user.is_verified:
            raise AuthenticationFailed('Account is not verified. Please check your email for verification instructions.')
        
        payload = {
            'id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=15),
            'iat': datetime.datetime.utcnow()
        }
        
        token = jwt.encode(payload, 'secret', algorithm='HS256')
        
        response = Response()
        
        # response.set_cookie(key='jwt', value=token, httponly=True, samesite='None', secure=True, path='/')
        response.set_cookie(key='jwt', value=token, httponly=True, samesite='None', secure=True, path='/', expires=datetime.datetime.utcnow() + datetime.timedelta(days=30))


        response.data = {
            'jwt': token
        }
        
        return response
    
    

# Verify the user with jwt
def get_user_with_jwt(request):
    token = request.COOKIES.get('jwt')
    print("use token is ", request.COOKIES.get('jwt'))
    
    if not token:
        raise AuthenticationFailed('Unauthenticated!')
    
    try:
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed('Unauthenticated!')
    
    user = User.objects.filter(id=payload['id']).first()
    return user
    
    
# View the user 
class UserView(APIView):
    def get(self, request):
        user = get_user_with_jwt(request)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    
#Logout 
class logoutView(APIView):
    def post(self, request):
        token = request.COOKIES.get('jwt')
        print("token is ", token)
        if not token:
            raise AuthenticationFailed('Please login first.')
        
        # response = HttpResponse()
        response = Response()
        response.set_cookie('jwt', '', max_age=0, path='/', samesite='None', secure=True)
        # response.delete_cookie('jwt')
        
        response.data = {
            'message': 'success'
        }
        return response
    

# Create the farm
class CreateFarmView(APIView):
    def post(self, request):
        user = get_user_with_jwt(request)
        
        if not user:
            raise AuthenticationFailed('User not found')
        

        try:
            # Extract data from the request
            data = request.data

            # Check if a farm with the same coordinates exists for the user
            existing_farm = Farm.objects.filter(user=user, latitude=data['latitude'], longitude=data['longitude']).first()
            

            if existing_farm:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'A farm with the same coordinates already exists for this user.'
                })

            # Assign the current user to the 'user' field
            data['user'] = user.id

            serializer = FarmSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': status.HTTP_201_CREATED,
                    'message': 'Farm created successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while creating the farm',
                'error': str(e)
            })
            

# Delete the farm
class DeleteFarmView(APIView):
    # authentication_classes = [CustomTokenAuthentication]  # Use the appropriate authentication class

    def delete(self, request, farm_id):        
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        # Retrieve the farm associated with the user and the provided farm_id
        farm = get_object_or_404(Farm, user=user, id=farm_id)

        # Delete the farm
        farm.delete()

        return Response({
            'status': status.HTTP_204_NO_CONTENT,
            'message': 'Farm deleted successfully'
        })

# Get the farm
class FarmListView(APIView):
    def get(self, request, farm_id=None):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')
        
        if farm_id is not None:
            # Get a specific farm by ID
            try:
                farm = Farm.objects.get(id=farm_id, user=user)
                serializer = FarmSerializer(farm)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Farm.DoesNotExist:
                return Response({'message': 'Farm not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Get all farms
            farms = Farm.objects.filter(user=user)
            serializer = FarmSerializer(farms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
    

# Create the season
class CreateSeasonView(APIView):
    def post(self, request):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Extract data from the request
            data = request.data


            

            # Assign the current user ID to the 'user' field
            data['user'] = user.id  # Check if user.id contains a valid integer

            # Pass the request object to the serializer context
            serializer = SeasonSerializer(data=data, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': status.HTTP_201_CREATED,
                    'message': 'Season created successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while creating the season',
                'error': str(e)
            })


# Update the season
class UpdateSeasonView(APIView):
    def post(self, request, season_id):
        user = get_user_with_jwt(request)
        
        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Check if the season with the provided ID exists
            season = Season.objects.filter(id=season_id).first()
            
            if not season:
                raise NotFound(detail="Season not found")

            # Ensure that the season being updated belongs to the authenticated user
            if season.user != user:
                raise AuthenticationFailed('Unauthorized')

            # Extract data from the request for updating the season
            data = request.data

            serializer = SeasonSerializer(season, data=data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': status.HTTP_200_OK,
                    'message': 'Season updated successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while updating the season',
                'error': str(e)
            })
    

# Delete the season
class DeleteSeasonView(APIView):
    def delete(self, request, season_id):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Check if the season with the provided ID exists
            season = Season.objects.filter(id=season_id).first()

            if not season:
                raise NotFound(detail="Season not found")

            # Ensure that the season being deleted belongs to the authenticated user
            if season.user != user:
                raise AuthenticationFailed('Unauthorized')

            # Delete the season
            season.delete()

            return Response({
                'status': status.HTTP_204_NO_CONTENT,
                'message': 'Season deleted successfully'
            })

        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while deleting the season',
                'error': str(e)
            })

# Get the season
class SeasonListView(APIView):

    def get(self, request, season_id=None):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            if season_id is not None:
                # Get a specific season by ID belonging to the current user
                season = Season.objects.filter(id=season_id, user=user).first()
                if not season:
                    return Response({'message': 'Season not found'}, status=status.HTTP_404_NOT_FOUND)

                serializer = SeasonSerializer(season)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # Get all seasons belonging to the current user
                seasons = Season.objects.filter(user=user)
                serializer = SeasonSerializer(seasons, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while fetching seasons',
                'error': str(e)
            })
            
            

# Create a new field
class CreateFieldView(APIView):

    def post(self, request):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Extract data from the request for creating a field
            data = request.data
            farm_id = data.get('farm')

            # Check if the farm ID belongs to the current user
            try:
                farm = Farm.objects.get(id=farm_id, user=user)
            except Farm.DoesNotExist:
                return Response({'message': 'You don\'t have such a farm.'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = FieldSerializer(data=data)

            if serializer.is_valid():
                # Associate the farm with the field and remove the 'season' field from the data
                serializer.validated_data['farm'] = farm
                serializer.validated_data.pop('season', None)
                serializer.save()

                return Response({
                    'status': status.HTTP_201_CREATED,
                    'message': 'Field created successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while creating the field',
                'error': str(e)
            })

# Update a field
class UpdateFieldView(APIView):

    def post(self, request, field_id):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Check if the field with the provided ID exists
            field = Field.objects.filter(id=field_id).first()

            if not field:
                raise NotFound(detail="Field not found")

            # Ensure that the field being updated belongs to the authenticated user
            if field.farm.user != user:
                raise AuthenticationFailed('Unauthorized')

            # Extract data from the request for updating the field
            data = request.data

            serializer = FieldSerializer(field, data=data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': status.HTTP_200_OK,
                    'message': 'Field updated successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while updating the field',
                'error': str(e)
            })

# Delete a field
class DeleteFieldView(APIView):

    def delete(self, request, field_id):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Check if the field with the provided ID exists
            field = Field.objects.filter(id=field_id).first()

            if not field:
                raise NotFound(detail="Field not found")

            # Ensure that the field being deleted belongs to the authenticated user
            if field.farm.user != user:
                raise AuthenticationFailed('Unauthorized')

            # Delete the field
            field.delete()

            return Response({
                'status': status.HTTP_204_NO_CONTENT,
                'message': 'Field deleted successfully'
            })

        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while deleting the field',
                'error': str(e)
            })
            
# Get the field
class FieldListView(APIView):

    def get(self, request, farm_id=None):
        user = get_user_with_jwt(request);
        print("User is ");
        print("This is field farm")

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            print("Farm id is ", farm_id)
            if farm_id is not None:
                # Get all fields belonging to the farm with the specified ID and the current user
                fields = Field.objects.filter(farm__id=farm_id, farm__user=user)
                serializer = FieldSerializer(fields, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # Get all fields belonging to the current user
                fields = Field.objects.filter(farm__user=user)
                
                serializer = FieldSerializer(fields, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while fetching fields',
                'error': str(e)
            })
            
            
# Create Crop Rotation view   
class CreateCropRotationView(APIView):

    def post(self, request):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            data = request.data
            field_id = data.get('field')
            season_id = data.get('season')  # Note the change here

            # Check if the field ID belongs to the current user's farm
            try:
                field = Field.objects.get(id=field_id, farm__user=user)
            except Field.DoesNotExist:
                return Response({'message': 'You don\'t have such a field.'}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure that the selected season belongs to the user
            try:
                season = Season.objects.get(id=season_id, user=user)
            except Season.DoesNotExist:
                return Response({'message': f'Season with ID {season_id} does not exist or does not belong to you.'}, status=status.HTTP_400_BAD_REQUEST)

            # Add the field ID and season ID to the data for creating the crop rotation
            data['field'] = field.id
            data['season'] = season.id  # Note the change here

            serializer = CropRotationSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': status.HTTP_201_CREATED,
                    'message': 'Crop rotation created successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while creating the crop rotation',
                'error': str(e)
            })

            
            
            
# Update the Crop Rotation view
class UpdateCropRotationView(APIView):
    serializer_class = CropRotationSerializer

    def post(self, request, season_id, field_id):  # Note the additional arguments to get data from the URL
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Check if season and field belong to the user
            try:
                season = Season.objects.get(id=season_id, user=user)
                field = Field.objects.get(id=field_id, farm__user=user)
            except (Season.DoesNotExist, Field.DoesNotExist):
                return Response({'message': 'Season or Field does not exist or does not belong to you.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check for an existing crop rotation for the provided season and field
            try:
                instance = CropRotation.objects.get(season=season, field=field)
            except CropRotation.DoesNotExist:
                return Response({'message': 'Crop rotation not found'}, status=status.HTTP_404_NOT_FOUND)

            # Extract and update data from the request
            data = {
                'crop_name': request.data.get('crop_name', instance.crop_name),
                'planting_date': request.data.get('planting_date', instance.planting_date),
                'harvesting_date': request.data.get('harvesting_date', instance.harvesting_date),
                'crop_variety': request.data.get('crop_variety', instance.crop_variety),
            }

            serializer = self.serializer_class(instance, data=data, partial=True)

            if serializer.is_valid():
                serializer.save()

                return Response({
                    'status': status.HTTP_200_OK,
                    'message': 'Crop rotation updated successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while updating the crop rotation',
                'error': str(e)
            })

            
# Get the Crop Rotation view with id and all 
class CropRotationListView(APIView):

    def get(self, request, season_id=None, field_id=None):  # Make arguments optional with default value as None
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # If both season_id and field_id are provided, get the specific crop rotation
            if season_id and field_id:
                crop_rotation = CropRotation.objects.filter(season__id=season_id, field__id=field_id, field__farm__user=user).first()
                
                if not crop_rotation:
                    raise NotFound(detail="Crop rotation not found")

                serializer = CropRotationSerializer(crop_rotation)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # If no specific season_id and field_id are provided, get all crop rotations for the user
                crop_rotations = CropRotation.objects.filter(field__farm__user=user)
                serializer = CropRotationSerializer(crop_rotations, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while fetching crop rotations',
                'error': str(e)
            })

            
#Delete the crop rotation    
    
class DeleteCropRotationView(APIView):

    def get(self, request, crop_rotation_id):
        user = get_user_with_jwt(request)
        print("You are at the deletion of the crop rotation")

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            crop_rotation = CropRotation.objects.get(id=crop_rotation_id)
            
            # Check if the user has permissions to delete this crop rotation
            if crop_rotation.field.farm.user != user:
                return Response({'message': 'You do not have permission to delete this crop rotation.'}, status=status.HTTP_403_FORBIDDEN)

            # Delete the crop rotation
            crop_rotation.delete()

            return Response({
                'status': status.HTTP_200_OK,
                'message': 'Crop rotation deleted successfully',
            })

        except CropRotation.DoesNotExist:
            return Response({'message': 'Crop rotation not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while deleting the crop rotation',
                'error': str(e)
            })

class JobListView(APIView):

    def get(self, request, field_id=None):  # Making field_id optional with a default value of None
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # If field_id is provided, get the jobs specific to that field
            if field_id:
                field_jobs = Job.objects.filter(field__id=field_id, field__farm__user=user)

                # If no jobs found for the specified field
                if not field_jobs.exists():
                    raise NotFound(detail="No jobs found for the specified field")

                serializer = JobSerializer(field_jobs, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # If no specific field_id is provided, get all jobs for the user
                all_jobs = Job.objects.filter(field__farm__user=user)
                serializer = JobSerializer(all_jobs, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while fetching jobs',
                'error': str(e)
            })

# Create Job
class CreateJobView(APIView):

    def post(self, request):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            data = request.data
            field_id = data.get('field')

            # Check if the field ID belongs to the current user's farm
            try:
                field = Field.objects.get(id=field_id, farm__user=user)
            except Field.DoesNotExist:
                return Response({'message': 'You don\'t have such a field.'}, status=status.HTTP_400_BAD_REQUEST)

            # Add the field ID to the data for creating the job
            data['field'] = field.id

            serializer = JobSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                
                return Response({
                    'status': status.HTTP_201_CREATED,
                    'message': 'Job created successfully',
                    'data': serializer.data
                })
            else:
                return Response({
                    'status': status.HTTP_400_BAD_REQUEST,
                    'message': 'Invalid data',
                    'errors': serializer.errors
                })
        except Exception as e:
            return Response({
                'status': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An error occurred while creating the job',
                'error': str(e)
            })


# Changing the status to complete job
class UpdateJobStatusView(APIView):
    def post(self, request, job_id):
        user = get_user_with_jwt(request)

        if not user:
            raise AuthenticationFailed('User not found')

        try:
            # Assuming you have a mechanism to ensure the job belongs to the user's farm
            job = Job.objects.get(id=job_id, field__farm__user=user)
        except Job.DoesNotExist:
            raise NotFound('Job not found')

        # Update the job status to 'Completed'
        job.status = 'Completed'
        job.save(update_fields=['status'])

        # Serialize the updated job
        serializer = JobSerializer(job)
        
        # Return a success response
        return Response({
            'status': status.HTTP_200_OK,
            'message': 'Job status updated to completed successfully',
            'data': serializer.data
        })

class TestModelView(APIView):
    ee.Initialize()
        
    def post(self, request):
        coords = request.data.get('coordinates', [])
        # Convert the provided lat-lng to the format expected by Earth Engine
        coordinates = [(coord['lng'], coord['lat']) for coord in coords]
        # print("Coordinates are ", coordinates)
        # Fetch the data from GEE
        data = self.fetch_bands(coordinates)
        # print("Data is ", data)
        
        
        # Define the desired sequence of bands
        bands_sequence = ['B1', 'B11', 'B12', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'EVI', 'GNDVI', 'NDVI']
        # Convert the data into the specified format
        formatted_data = []
        data_length = len(data[bands_sequence[0]])
        for i in range(data_length):
            data_point = [data[band][i] for band in bands_sequence if band in data]
            formatted_data.append(data_point)
        # print("Formated Sequence is ", formatted_data)
        
        ndvi_values = [point[-1] for point in formatted_data]

        # print("NDVI values are:", ndvi_values)
        
        # Convert to numpy array
        formatted_data_np = np.array(formatted_data)
        
        # Standardize the data
        scaler = StandardScaler()
        standardized_data = scaler.fit_transform(formatted_data_np)
        # print("Standardized Data: \n", standardized_data)
        
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, 'rf_model.pkl')
        scaler_path = os.path.join(BASE_DIR, 'scaler.pkl')
                
        rf_model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        # Loop through each row of standardized_data and make predictions
        predicted_classes = []
        for data_point in standardized_data:
            data_array = np.array([data_point])
            predicted_class = rf_model.predict(data_array)
            predicted_classes.append(int(predicted_class[0]))
            
        # Print the predicted classes
        # print(predicted_classes)
        # Count occurrences of 0 and 1
        count_0 = predicted_classes.count(0)
        count_1 = predicted_classes.count(1)

        # Determine the response based on counts
        if count_1 + 20 > count_0:
            response_data = "Mostly corn"
        elif count_0 > count_1 + 20:
            response_data = "Not-corn"
        else:
            response_data = "Mostly corn"
            
        # Collect the NDVI values for the response
        ndvi_response_data = {'ndvi_values': ndvi_values}

        # Optionally, you can include the other response data
        ndvi_response_data.update({"result": response_data})

        # Return the determined response
        return Response(ndvi_response_data)

    def fetch_bands(self, coordinates):
        # Convert the coordinates to a Geometry object
        region = ee.Geometry.Polygon(coordinates)

        # Fetch the desired image (e.g., Sentinel-2)
        image = (ee.ImageCollection('COPERNICUS/S2')
                .filterBounds(region)
                .filterDate('2023-03-25', '2023-04-15')
                )  
        image = image.median()

        # Define the bands you want to extract
        bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B11', 'B12']

        # Extract the bands
        selected_image = image.select(bands)

        # Calculate the NDVI
        ndvi = selected_image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        # Calculate the GNDVI
        gndvi = selected_image.normalizedDifference(['B3', 'B4']).rename('GNDVI')

        # Calculate the EVI
        evi = selected_image.expression(
            '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
            {
                'NIR': selected_image.select('B8'),
                'RED': selected_image.select('B4'),
                'BLUE': selected_image.select('B2')
            }
        ).rename('EVI')

        # Combine the bands and NDVI
        combined_image = selected_image.addBands(ndvi).addBands(gndvi).addBands(evi)
        
        # Extract the data
        extracted_data = combined_image.reduceRegion(
            reducer=ee.Reducer.toList(),
            geometry=region,
            scale=10
        ).getInfo()
        

        return extracted_data
    

















import pandas as pd


class IrrigationModel(APIView):
    ee.Initialize()
        
    def post(self, request):
        coords = request.data.get('coordinates', [])
        # Convert the provided lat-lng to the format expected by Earth Engine
        coordinates = [(coord['lng'], coord['lat']) for coord in coords]
        # print("Coordinates are ", coordinates)
        # Fetch the data from GEE
        data = self.fetch_bands_from_s1(coordinates)
        # print("Data is ", data)
        
        # Define the features' sequence as per the provided image
        features_sequence = ['CPR', 'PD', 'RVI', 'VH', 'VV', 'CPR1', 'PD1', 'RVI1', 'VH1', 'VV1', 'CPR2', 'PD2', 'RVI2', 'VH2', 'VV2']
        formatted_data = self.format_data(data, features_sequence)
        
        formatted_data1 = {'CPR': formatted_data[0][0],
    'PD': formatted_data[0][1],
    'RVI': formatted_data[0][2],
    'VH': formatted_data[0][3],
    'VV': formatted_data[0][4],
    'CPR1': formatted_data[1][0],
    'PD1': formatted_data[1][1],
    'RVI1': formatted_data[1][2],
    'VH1': formatted_data[1][3],
    'VV1': formatted_data[1][4],
    'CPR2': formatted_data[2][0],
    'PD2': formatted_data[2][1],
    'RVI2': formatted_data[2][2],
    'VH2': formatted_data[2][3],
    'VV2': formatted_data[2][4]}
        
        # Convert the formatted data to a DataFrame with the correct column names
        formatted_data1 = pd.DataFrame([formatted_data1])
        # print("formatted_data1 ", formatted_data1)s
        # print("First instance is ", formatted_data1[0][0])
        
        
        # Assuming the model and scaler are saved in the same directory as this file
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, 'random_forest_model.pkl')
        
        # Load the RandomForestRegressor model
        rf_model = joblib.load(model_path)
        
        # Reshape formatted_data if necessary to match the model's expected input
        # if isinstance(formatted_data, list):
        #     formatted_data = np.array([formatted_data])
            
        # Predict using the loaded model
        predictions = rf_model.predict(formatted_data1)
        
        # Taking the floor value of predictions 
        predictions = np.floor(predictions)
        
        return Response(predictions)
        

    def fetch_bands_from_s1(self, coordinates):
        # Assuming the coordinates form a Polygon
        region = ee.Geometry.Polygon(coordinates)
        
        
        # Calculate today's date and the date 40 days ago
        today = datetime.datetime.now()
        forty_days_ago = today - datetime.timedelta(days=40)

        # Format dates in 'YYYY-MM-DD' format
        start_date = forty_days_ago.strftime('%Y-%m-%d')
        end_date = today.strftime('%Y-%m-%d')
        
        # Fetch Sentinel-1 images
        image_collection = (ee.ImageCollection('COPERNICUS/S1_GRD')
                            .filterBounds(region)
                            .filterDate(start_date, end_date)  
                            .filter(ee.Filter.eq('instrumentMode', 'IW'))  # Interferometric Wide swath
                            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
                            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
                            .limit(3))        
        
        # Function to calculate indices for each image
        def calculate_indices(image):
            vh = image.select('VH')
            vv = image.select('VV')

            # Calculate indices
            cpr = vh.divide(vv).rename('CPR')
            pd = vv.subtract(vh).rename('PD')
            rvi = vv.divide(vh).rename('RVI')

            return image.addBands(cpr).addBands(pd).addBands(rvi)

        # Map the function over the image collection
        indexed_collection = image_collection.map(calculate_indices)

        # Initialize a dictionary to store the extracted data
        extracted_data = {
            'CPR': [],
            'PD': [],
            'RVI': [],
            'VH': [],
            'VV': []
        }

        # Iterate over the image collection to extract the indices
        for i in range(3):  # Loop only 3 times since we're sure there are only 3 images
            image = ee.Image(indexed_collection.toList(3).get(i))

            # Extract the bands data for the image
            band_data = image.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=10
            ).getInfo()

            # Append the mean values of the indices to the extracted_data list
            for band in extracted_data.keys():
                extracted_data[band].append(band_data[band])

        # print(extracted_data)
        return extracted_data
    
    
    def format_data(self, data, sequence):
        # Format the data into a list of lists where each sublist represents feature values for one data point
        formatted_data = []
        for feature in sequence:
            if feature in data:
                formatted_data.append(data[feature])

        # Transpose the list of lists to match the feature sequence
        formatted_data = list(map(list, zip(*formatted_data)))
        return formatted_data


        # Define the bands you want to extract
        # bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B11', 'B12']

        # # Extract the bands
        # selected_image = image.select(bands)

        # # Calculate the NDVI
        # ndvi = selected_image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        # # Calculate the GNDVI
        # gndvi = selected_image.normalizedDifference(['B3', 'B4']).rename('GNDVI')

        # # Calculate the EVI
        # evi = selected_image.expression(
        #     '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        #     {
        #         'NIR': selected_image.select('B8'),
        #         'RED': selected_image.select('B4'),
        #         'BLUE': selected_image.select('B2')
        #     }
        # ).rename('EVI')

        # # Combine the bands and NDVI
        # combined_image = selected_image.addBands(ndvi).addBands(gndvi).addBands(evi)
        
        # Extract the data
        # extracted_data = combined_image.reduceRegion(
        #     reducer=ee.Reducer.toList(),
        #     geometry=region,
        #     scale=10
        # ).getInfo()
        

        # return extracted_data
    

