from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🧠 Simulated GPIO pin mapping
MOTOR_PINS = {
    'forward': 17,
    'backward': 18,
    'left': 22,
    'right': 23
}

# Simulated pin states
pin_states = {pin: False for pin in MOTOR_PINS.values()}
pin_states.update({
    'pump': False,
    'vacuum': False,
    'centre': False,
    'side': False,
    'mop': False,
    'mop_up': False,
    'mop_down': False,
    'centre_brush': False,
    'centre_brush_up': False,
    'centre_brush_down': False
})

# 🧩 Helper functions
def stop_all_motors():
    """Stop only movement motors"""
    for pin in MOTOR_PINS.values():
        pin_states[pin] = False

def stop_everything():
    """Stop all movement and function pins"""
    for key in pin_states:
        pin_states[key] = False


# 🚗 Movement route
@app.route('/move/<direction>', methods=['GET'])
def move(direction):
    stop_all_motors()
    if direction in MOTOR_PINS:
        pin_states[MOTOR_PINS[direction]] = True
        return jsonify({"status": f"Simulated moving {direction}"}), 200
    elif direction == 'stop':
        stop_all_motors()
        return jsonify({"status": "Simulated stop movement"}), 200
    else:
        return jsonify({"error": "Invalid direction"}), 400


# 💧 Function toggle routes
@app.route('/toggle/pump', methods=['GET'])
def toggle_pump():
    pin_states['pump'] = not pin_states['pump']
    return jsonify({"pump": f"{'on' if pin_states['pump'] else 'off'}"}), 200

@app.route('/toggle/vacuum', methods=['GET'])
def toggle_vacuum():
    pin_states['vacuum'] = not pin_states['vacuum']
    return jsonify({"vacuum": f"{'on' if pin_states['vacuum'] else 'off'}"}), 200

@app.route('/toggle/centre', methods=['GET'])
def toggle_centre():
    pin_states['centre'] = not pin_states['centre']
    return jsonify({"centre": f"{'on' if pin_states['centre'] else 'off'}"}), 200

@app.route('/toggle/side', methods=['GET'])
def toggle_side():
    pin_states['side'] = not pin_states['side']
    return jsonify({"side": f"{'on' if pin_states['side'] else 'off'}"}), 200


# 🧽 Mop Control (on/off + up/down)
@app.route('/toggle/mop', methods=['GET'])
def toggle_mop():
    pin_states['mop'] = not pin_states['mop']
    return jsonify({"mop": f"{'on' if pin_states['mop'] else 'off'}"}), 200

@app.route('/mop/up', methods=['GET'])
def mop_up():
    pin_states['mop_up'] = True
    pin_states['mop_down'] = False
    return jsonify({"mop": "moving up"}), 200

@app.route('/mop/down', methods=['GET'])
def mop_down():
    pin_states['mop_down'] = True
    pin_states['mop_up'] = False
    return jsonify({"mop": "moving down"}), 200


# 🧹 Centre Brush Control (on/off + up/down)
@app.route('/toggle/centrebrush', methods=['GET'])
def toggle_centrebrush():
    pin_states['centre_brush'] = not pin_states['centre_brush']
    return jsonify({"centre_brush": f"{'on' if pin_states['centre_brush'] else 'off'}"}), 200

@app.route('/centrebrush/up', methods=['GET'])
def centre_brush_up():
    pin_states['centre_brush_up'] = True
    pin_states['centre_brush_down'] = False
    return jsonify({"centre_brush": "moving up"}), 200

@app.route('/centrebrush/down', methods=['GET'])
def centre_brush_down():
    pin_states['centre_brush_down'] = True
    pin_states['centre_brush_up'] = False
    return jsonify({"centre_brush": "moving down"}), 200


# 🛑 Stop movement only 
@app.route('/stop/move', methods=['GET'])
def stop_move():
    stop_all_motors()
    return jsonify({"status": "All movement stopped"}), 200


# 🛑 Stop everything
@app.route('/stop/all', methods=['GET'])
def stop_all():
    stop_everything()
    return jsonify({"status": "All systems stopped"}), 200


# 🏠 Home
@app.route('/')
def home():
    return jsonify({"message": "Robot control API running (simulation mode)"}), 200


# 🧾 Log every request
@app.before_request
def log_request():
    print(f"➡️  Received {request.method} {request.path}")


# 🚀 Run server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
