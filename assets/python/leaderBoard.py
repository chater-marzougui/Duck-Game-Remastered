import cv2, time, threading, os, json, numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")


# Shared variables
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
thread = threading.Thread()
detect_markers = False
skip_frame = 0
player1CanShoot = False
player2CanShoot = False
aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)
aruco_params = cv2.aruco.DetectorParameters()
leaderboard_file = 'leaderboard.json'
player1Positioning = [(0, 0), (480, 640)]
player2Positioning = [(0, 0), (480, 640)]
player = ""

if not os.path.exists(leaderboard_file):
    with open(leaderboard_file, 'w') as file:
        json.dump({"bestScore": 1, "entries": []}, file)


@socketio.on('tracking_data')
def handle_tracking_data(data):
    global detect_markers
    detect_markers = data

@app.route('/save_coordinates', methods=['POST'])
def save_coordinates():
    data = request.get_json()
    if not data or data.get('game') != "start":
        return jsonify({"status": "error", "message": "No coordinates provided"}), 400

    ret, _ = cap.read()
    if ret:
        print("Saved")

    try:
        return jsonify({"status": "success", "message": "Coordinates saved successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.json
    SB = data['SB']
    userName = data['userName']
    theMessage = data['theMessage']
    theScore = int(data['theScore'])

    with open(leaderboard_file, 'r') as file:
        leaderboard = json.load(file)

    if theScore > leaderboard["bestScore"]:
        leaderboard["bestScore"] = theScore

    leaderboard["entries"].append({
        "SB": SB,
        "userName": userName,
        "theMessage": theMessage,
        "theScore": theScore
    })

    leaderboard["entries"].sort(key=lambda entry: entry["theScore"], reverse=True)

    with open(leaderboard_file, 'w') as file:
        json.dump(leaderboard, file)

    return 'Score submitted successfully!', 200

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    with open(leaderboard_file, 'r') as file:
        leaderboard = json.load(file)
        leaderboard["entries"].sort(key=lambda entry: entry["theScore"], reverse=True)
    return jsonify(leaderboard)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

def send_detected(corners, ids, width):
    global player1CanShoot, player2CanShoot
    for i, marker_id in enumerate(ids):
        corner = corners[i][0]
        center = tuple(np.mean(corner, axis=0).astype(int))
        data = None
        if marker_id[0] == 12:
            player_id = "player1"
            x , y = final_point(center, player_id, width)
            if x is None or y is None: continue
            data = {'x': x, 'y': y, 'player_id': player_id, 'should_shoot': player1CanShoot}
            player1CanShoot = False
        elif marker_id[0] == 33:
            player_id = "player2"
            x , y = final_point(center, player_id, width)
            if x is None or y is None: continue
            data = {'x': x, 'y': y, 'player_id': player_id, 'should_shoot': player2CanShoot}
            player2CanShoot = False
        if data:
            socketio.emit('position', data)

def send_detected_single_player(corners, ids, width):
    global player1CanShoot, player2CanShoot, player
    for i, marker_id in enumerate(ids):
        data = None
        player_id = "player1" if marker_id[0] == 12 else "player2"
        if player_id != player: continue
        playerCanShoot = player1CanShoot if marker_id[0] == 12 else player2CanShoot
        player1CanShoot = False
        player2CanShoot = False
        corner = corners[i][0]
        center = tuple(np.mean(corner, axis=0).astype(int))
        
        x , y = final_point(center, player, width)
        if x is None or y is None: continue
        
        data = {'x': x, 'y': y, 'player_id': player, 'should_shoot': playerCanShoot}
        playerCanShoot = False

        if data:
            socketio.emit('position', data)

def final_point(center: tuple, player, width):
    global player1Positioning, player2Positioning
    xi, yi = width - center[0], center[1]
    if player == "player1":
        x1, y1= player1Positioning[0]
        x2, y2= player1Positioning[1]
    else:
        x1, y1= player2Positioning[0]
        x2, y2= player2Positioning[1]
    
    x_point = round((xi - x1) / (x2 - x1), 6)
    y_point = round((yi - y1) / (y2 - y1), 6)
    
    if x_point > 1.1 or y_point > 1.1:
        return None, None
    if x_point < -0.1 or y_point < -0.1:
        return None, None
    
    if x_point > 1: x_point = 1
    if y_point > 1: y_point = 1
    if x_point < 0: x_point = 0
    if y_point < 0: y_point = 0
    return x_point , y_point 
    

def detect_position(player):
    global aruco_dict, aruco_params, player1CanShoot, player2CanShoot
    if player == "player1":
        player2CanShoot = False
    elif player == "player2":
        player1CanShoot = False
        
    ret, frame = cap.read()
    if not ret:
        return None

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    corners, ids, _ = cv2.aruco.ArucoDetector(aruco_dict, detectorParams=aruco_params).detectMarkers(gray)
    width = frame.shape[1]
    if ids is not None:
        for i, marker_id in enumerate(ids):
            corner = corners[i][0]
            center = tuple(np.mean(corner, axis=0).astype(int))
            if (marker_id[0] == 12 and player1CanShoot) or (marker_id[0] == 33 and player2CanShoot):
                return (width - center[0], center[1])
    return None

def adjust_player_box(arr : list[tuple], player):
    global player1Positioning, player2Positioning
    x1, y1 = 99999, 99999
    x2, y2 = -1, -1
    for i in arr:
        x , y = i
        if x < x1 : x1 = x
        if y < y1 : y1 = y
        if x > x2 : x2 = x
        if y > y2 : y2 = y
    if player == 'player1':
        player1Positioning = [(x1, y1), (x2, y2)]
        print("box positioning of player 1 " ,player1Positioning)
    else :
        player2Positioning = [(x1, y1), (x2, y2)]
        print("box positioning of player 2 " ,player2Positioning)
         

def camera_thread():
    global detect_markers, skip_frame, aruco_dict, aruco_params, player
    while True:
        if detect_markers:
            ret, frame = cap.read()
            if not ret:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            corners, ids, _ = cv2.aruco.ArucoDetector(aruco_dict, detectorParams=aruco_params).detectMarkers(gray)

            if ids is not None:
                if player == "":
                    send_detected(corners, ids, frame.shape[1])
                else: 
                    send_detected_single_player(corners, ids, frame.shape[1])
            
            time.sleep(0.01)
        else:
            time.sleep(0.02)

@app.route('/shoot', methods=['GET'])
def shoot():
    global player1CanShoot, player2CanShoot, player
    playerID = request.args.get('player')
    shoot = request.args.get('shoot')

    if playerID and shoot:
        if playerID != player and player != "":
            socketio.emit('intruder', playerID)
            return "Shoot event received", 200
        
        if playerID == 'player1':
            player1CanShoot = True
        elif playerID == 'player2':
            player2CanShoot = True
        return "Shoot event received", 200
    else:
        return "Invalid request", 400

def adjust_multi_player():
    global player1CanShoot, player2CanShoot
    arr1 = []
    arr2 = []
    
    while len(arr1) != 4:
        while not player1CanShoot:
            if player2CanShoot:
                player2CanShoot = False
                socketio.emit('shakeModals', 'player2')
            time.sleep(0.01)
            
        pos = detect_position('player1')
        player1CanShoot = False
        if pos:
            socketio.emit('adjustment_shot', 'player1')
            arr1.append(pos)
            
    while len(arr2) != 4:
        while not player2CanShoot:
            if player1CanShoot:
                player1CanShoot = False
                socketio.emit('shakeModals', 'player1')
            time.sleep(0.01)
            
        pos = detect_position('player2')
        player2CanShoot = False
        if pos:
            socketio.emit('adjustment_shot', 'player2')
            arr2.append(pos)

    adjust_player_box(arr1, 'player1')
    adjust_player_box(arr2, 'player2')

def adjust_single_player():
    global player1CanShoot, player2CanShoot, player
    arr1 = []
    while not (player1CanShoot or player2CanShoot): time.sleep(0.01)
    if player1CanShoot:
        pos = detect_position('player1')
        player1CanShoot = False
        player = 'player1'
    if player2CanShoot:
        pos = detect_position('player2')
        player2CanShoot = False
        player = 'player2'
    arr1.append(pos)
    socketio.emit('determinePlayer', player)
    while len(arr1) != 4:
        while not (player1CanShoot or player2CanShoot): time.sleep(0.01)
        if player1CanShoot and player == 'player1':
            pos = detect_position('player1')
            player1CanShoot = False
        elif player2CanShoot and player == 'player2':
            pos = detect_position('player2')
            player2CanShoot = False
        else:
            socketio.emit('shakeModals', player)
        arr1.append(pos)
    adjust_player_box(arr1, player)


@socketio.on('adjust-shooting')
def adjust_shooting(data):
    global player1CanShoot, player2CanShoot, player
    if data.get('type') == "MultiPlayer":
        print("adjusting Multi player")
        player = ""
        adjust_multi_player()
    elif data.get('type') == 'SinglePlayer':
        print("adjusting Single player")
        adjust_single_player()
    
    thread = threading.Thread(target=camera_thread)
    thread.start()
        

if __name__ == '__main__':
    try:
        socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)
    finally:
        cap.release()
        thread.join()
        cv2.destroyAllWindows()