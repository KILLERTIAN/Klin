from flask import Flask, jsonify
import RPi.GPIO as GPIO
import time

app = Flask(__name__)

# 🧠 Example GPIO pin mapping — adjust these for your setup
MOTOR_PINS = {
    'forward': 17,
    'backward': 18,
    'left': 22,
    'right': 23
}

PUMP_PIN = 24
VACUUM_PIN = 25
CENTRE_PIN = 5
SIDE_PIN = 6

# 🔧 Setup GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Setup all pins as output
for pin in MOTOR_PINS.values():
    GPIO.setup(pin, GPIO.OUT)
GPIO.setup(PUMP_PIN, GPIO.OUT)
GPIO.setup(VACUUM_PIN, GPIO.OUT)
GPIO.setup(CENTRE_PIN, GPIO.OUT)
GPIO.setup(SIDE_PIN, GPIO.OUT)

# Helper function to stop all movement
def stop_all_motors():
    for pin in MOTOR_PINS.values():
        GPIO.output(pin, GPIO.LOW)

@app.route('/move/<direction>', methods=['GET'])
def move(direction):
    stop_all_motors()
    if direction in MOTOR_PINS:
        GPIO.output(MOTOR_PINS[direction], GPIO.HIGH)
        return jsonify({"status": f"Moving {direction}"}), 200
    elif direction == 'stop':
        stop_all_motors()
        return jsonify({"status": "Stopped"}), 200
    else:
        return jsonify({"error": "Invalid direction"}), 400

@app.route('/toggle/pump', methods=['GET'])
def toggle_pump():
    GPIO.output(PUMP_PIN, not GPIO.input(PUMP_PIN))
    return jsonify({"pump": "toggled"}), 200

@app.route('/toggle/vacuum', methods=['GET'])
def toggle_vacuum():
    GPIO.output(VACUUM_PIN, not GPIO.input(VACUUM_PIN))
    return jsonify({"vacuum": "toggled"}), 200

@app.route('/toggle/centre', methods=['GET'])
def toggle_centre():
    GPIO.output(CENTRE_PIN, not GPIO.input(CENTRE_PIN))
    return jsonify({"centre": "toggled"}), 200

@app.route('/toggle/side', methods=['GET'])
def toggle_side():
    GPIO.output(SIDE_PIN, not GPIO.input(SIDE_PIN))
    return jsonify({"side": "toggled"}), 200

@app.route('/')
def home():
    return jsonify({"message": "Robot control API running"}), 200

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        GPIO.cleanup()
