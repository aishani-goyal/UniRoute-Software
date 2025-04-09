from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
import random
import logging
import os
from dotenv import load_dotenv
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app, supports_credentials=True)

# Secret key for sessions
app.secret_key = 'otp_secret_key'

# Logging setup
logging.basicConfig(level=logging.INFO)

# Email Configuration
SENDER_EMAIL = "bhoomimehta2004@gmail.com"
SENDER_PASSWORD = "ckkf cyjx qqjv mlzc"

# Twilio Configuration
account_sid = os.getenv('TWILIO_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_number = os.getenv('TWILIO_PHONE_NUMBER')
client = Client(account_sid, auth_token)

# Send OTP via Twilio
@app.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json()
        app.logger.info("Received data for send-otp: %s", data)
        phone = data.get('phone')

        if not phone:
            app.logger.error("No phone number provided")
            return jsonify({'success': False, 'message': 'Phone number is required'}), 400

        otp = str(random.randint(100000, 999999))
        session['otp'] = otp
        session['phone'] = phone

        message = client.messages.create(
            body=f'Your OTP is: {otp}',
            from_=twilio_number,
            to=phone
        )

        app.logger.info("OTP sent with SID: %s", message.sid)
        return jsonify({'success': True, 'message': 'OTP sent successfully!'})

    except Exception as e:
        app.logger.exception("Exception in send_otp:")
        return jsonify({'success': False, 'message': str(e)}), 500

# Verify OTP
@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        user_otp = data.get('otp')

        if not user_otp:
            return jsonify({'success': False, 'message': 'OTP is required'}), 400

        if session.get('otp') == user_otp:
            return jsonify({'success': True, 'message': 'OTP verified!'})
        else:
            return jsonify({'success': False, 'message': 'Incorrect OTP'}), 400

    except Exception as e:
        app.logger.exception("Exception in verify_otp:")
        return jsonify({'success': False, 'message': str(e)}), 500

# Send email with password
@app.route('/send-password', methods=['POST'])
def send_password():
    data = request.get_json()
    recipient_email = data.get('email')
    password = data.get('password')

    if not recipient_email or not password:
        return jsonify({'error': 'Email and access code required'}), 400

    try:
        subject = "Your Access Code for UniRoute"
        plain_body = f"""Dear Student,

Welcome to the UniRoute portal.

Your temporary access code is: {password}

Please use this code to log in and change it after your first use.

Regards,
UniRoute
"""
        html_body = f"""
        <html>
        <body>
            <p>Dear Student,</p>
            <p>Welcome to the <strong>UniRoute</strong> portal.</p>
            <p><strong>Your temporary access code is:</strong>
                <span style="font-size:16px; color:#007BFF;">{password}</span>
            </p>
            <p>Please use this code to log in and change it after your first use.</p>
            <br>
            <p>Regards,<br><strong>UniRoute</strong></p>
        </body>
        </html>
        """

        msg = MIMEMultipart("alternative")
        msg['From'] = f"<{SENDER_EMAIL}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg['Reply-To'] = SENDER_EMAIL

        msg.attach(MIMEText(plain_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)

        return jsonify({'message': 'Email sent successfully!'}), 200

    except Exception as e:
        app.logger.exception("Error sending email:")
        return jsonify({'error': str(e)}), 500

# Serve frontend
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Global error handler
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.exception("Global error caught:")
    return jsonify({'success': False, 'message': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
