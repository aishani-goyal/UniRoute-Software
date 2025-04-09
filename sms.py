from flask import Flask, request, jsonify, send_from_directory, session
from twilio.rest import Client
from flask_cors import CORS
import random
import logging
import os

app = Flask(__name__, static_url_path='', static_folder='.')
# Enable CORS with support for credentials
CORS(app, supports_credentials=True)

# Set a secret key (required for session management)
app.secret_key = 'otp_secret_key'

# Setup logging
logging.basicConfig(level=logging.INFO)

# Twilio credentials - update these with your actual credentials
account_sid = 'AC6b7edbb3424794359b2af46257b995e7'
auth_token = '30a8e5c3956dfc44071f0c296ba5e6a0'
# This is your "from" phone number. Do not change to the recipient's number.
twilio_number = '+19203108262'
client = Client(account_sid, auth_token)

# Generate OTP (for the manual method)
def generate_otp():
    return str(random.randint(100000, 999999))

@app.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        data = request.get_json()
        app.logger.info("Received data for send-otp: %s", data)
        phone = data.get('phone')

        # Verify the phone input
        if not phone:
            app.logger.error("No phone number provided")
            return jsonify({'success': False, 'message': 'Phone number is required'}), 400

        # Generate an OTP and store it in the session
        otp = generate_otp()
        session['otp'] = otp
        session['phone'] = phone

        try:
            # Try sending the SMS via Twilio
            message = client.messages.create(
                body=f'Your OTP is: {otp}',
                from_=twilio_number,
                to=phone
            )
            app.logger.info("OTP sent with SID: %s", message.sid)
            return jsonify({'success': True, 'message': 'OTP sent successfully!'})
        except Exception as e:
            app.logger.exception("Error sending OTP:")
            return jsonify({'success': False, 'message': str(e)}), 500
    except Exception as e:
        app.logger.exception("Exception in send_otp:")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        app.logger.info("Received data for verify-otp: %s", data)
        user_otp = data.get('otp')

        if not user_otp:
            app.logger.error("OTP not provided")
            return jsonify({'success': False, 'message': 'OTP is required'}), 400

        # Compare the provided OTP with the one in the session
        if session.get('otp') == user_otp:
            return jsonify({'success': True, 'message': 'OTP verified!'})
        else:
            app.logger.error(f"Incorrect OTP. Expected: {session.get('otp')}, Got: {user_otp}")
            return jsonify({'success': False, 'message': 'Incorrect OTP'})
    except Exception as e:
        app.logger.exception("Exception in verify_otp:")
        return jsonify({'success': False, 'message': str(e)}), 500

# Serve the HTML file
@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Global error handler to always return JSON
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.exception("Global error caught:")
    return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
