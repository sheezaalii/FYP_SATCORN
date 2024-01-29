from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=255, default='')
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255, default='')
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, null=True, blank=True, default=None)
    username = None

    USERNAME_FIELD = 'email'

    REQUIRED_FIELDS = []

class Farm(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    farm_name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=35, decimal_places=20)
    longitude = models.DecimalField(max_digits=35, decimal_places=20)

    def __str__(self):
        return self.farm_name

class Field(models.Model):
    field_name = models.CharField(max_length=255, default="Field")
    field_crop = models.CharField(max_length=255, default="Crop")
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fields')
    coordinates = models.JSONField()

    def __str__(self):
        return self.field_name

class Season(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    season_name = models.CharField(max_length=255, default="Season")
    start_date = models.DateField(null=True, blank=True, default='2000-01-01')
    end_date = models.DateField(null=True, blank=True, default='2000-01-02')

    class Meta:
        unique_together = ('user', 'start_date', 'end_date')

    def __str__(self):
        return f'Season for {self.user.username}: {self.start_date} to {self.end_date}'


class CropRotation(models.Model):
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name='crop_rotations', null=True)
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='crop_rotations')
    crop_name = models.CharField(max_length=255, null=True, blank=True, default='Unknown Crop')
    planting_date = models.DateField(null=True, blank=True, default='2000-01-01')
    harvesting_date = models.DateField(null=True, blank=True, default='2000-01-02')
    crop_variety = models.CharField(max_length=255, null=True, blank=True, default='Unknown Variety')

    def __str__(self):
        return f'{self.crop_name} in {self.field}'
    

class Job(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Incomplete', 'Incomplete'),
    ]
    
    name = models.CharField(max_length=255)
    due_date = models.DateField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='jobs')

    def __str__(self):
        return self.name