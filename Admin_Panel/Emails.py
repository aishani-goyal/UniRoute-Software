from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can call this API

# Your Gmail credentials (Use App Password)
SENDER_EMAIL = "bhoomimehta2004@gmail.com"
SENDER_PASSWORD = "ckkf cyjx qqjv mlzc"

@app.route('/send-password', methods=['POST'])
def send_password():
    data = request.get_json()
    recipient_email = data.get('email')
    password = data.get('password')

    if not recipient_email or not password:
        return jsonify({'error': 'Email and access code required'}), 400

    try:
        # Email subject
        subject = "Your Access Code for UniRoute"

        # Plain text fallback (important for spam filters)
        plain_body = f"""Dear Student,

Welcome to the UniRoute portal.

Your temporary access code is: {password}

Please use this code to log in and change it after your first use.

Regards,
UniRoute
"""

        # HTML body
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

        # Compose the email
        msg = MIMEMultipart("alternative")
        msg['From'] = f"<{SENDER_EMAIL}>"
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg['Reply-To'] = SENDER_EMAIL

        # Attach both plain and HTML versions
        msg.attach(MIMEText(plain_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        # Send email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)

        return jsonify({'message': 'Email sent successfully!'}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({'error': str(e)}), 500

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
