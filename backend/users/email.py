from django.core.mail import send_mail
import random
from django.conf import settings
from .models import User

def send_opt_via_email(email):
    subject = 'Welcome to the SatCorn'
    random_num = random.randint(100, 99999)
    message = f'''
<!DOCTYPE html>
<html>
<head>
    <style>
        /* Define your CSS styles here */
        body {{
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }}

        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }}

        h1 {{
            color: #007bff;
            text-align: center;
            font-size: 28px;
            margin-bottom: 20px;
        }}

        p {{
            font-size: 18px;
            margin-bottom: 20px;
            line-height: 1.5;
            color: #333;
        }}

        .otp {{
            font-size: 48px;
            color: #007bff;
            text-align: center;
            margin-bottom: 30px;
        }}

        .signature {{
            text-align: center;
            margin-top: 20px;
        }}

        .btn {{
            display: inline-block;
            padding: 15px 30px;
            background-color: #007bff;
            color: #000000;
            text-decoration: none;
            border-radius: 5px;
            font-size: 18px;
            transition: background-color 0.3s ease;
        }}

        .btn:hover {{
            background-color: #0056b3;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to SatCorn</h1>
        <p>Welcome to SatCorn, where we're committed to revolutionizing your field management experience!</p>
        <p>Your OTP for signup is:</p>
        <p class="otp">{random_num}</p>
        <p>If you didn't create this profile, please ignore this email.</p>
        <div class="signature">
            <p>Regards,</p>
            <p><strong>SatCorn Team</strong></p>
        </div>
        <p style="text-align: center;">
            <a class="btn" href="#">Visit SatCorn</a>
        </p>
    </div>
</body>
</html>
'''



    email_from = settings.EMAIL_HOST_USER
    send_mail(
        subject,
        '',  # Leave the message parameter empty, as the email content is in HTML
        email_from,
        [email],
        html_message=message  # Set the email format to HTML
    )
    user_obj = User.objects.get(email=email)
    user_obj.otp = random_num
    user_obj.save()
