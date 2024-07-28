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
width_ratio = 1.0
height_ratio = 1.0
detect_markers = False
skip_frame = 0
player1CanShoot = False
player2CanShoot = False
aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)
aruco_params = cv2.aruco.DetectorParameters()
leaderboard_file = 'leaderboard.json'
player1Positioning = [(0, 0), (480, 640)]
player2Positioning = [(0, 0), (480, 640)]

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
    global player1CanShoot, player2CanShoot, width_ratio, height_ratio
    for i, marker_id in enumerate(ids):
        corner = corners[i][0]
        center = tuple(np.mean(corner, axis=0).astype(int))
        if marker_id[0] == 12:
            player_id = "player1"
            x , y = final_point(center, player_id, width)
            data = {'x': x, 'y': y, 'player_id': player_id, 'should_shoot': player1CanShoot}
            player1CanShoot = False
        elif marker_id[0] == 33:
            player_id = "player2"
            x , y = final_point(center, player_id, width)
            data = {'x': x, 'y': y, 'player_id': player_id, 'should_shoot': player2CanShoot}
            player2CanShoot = False
        if data:
            socketio.emit('position', data)

def final_point(center: tuple, player, width):
    global player1Positioning, player2Positioning, width_ratio, height_ratio
    xi, yi = width - center[0], center[1]
    if player == "player1":
        x1, y1= player1Positioning[0]
        x2, y2= player1Positioning[1]
    else:
        x1, y1= player2Positioning[0]
        x2, y2= player2Positioning[1]
    
    x_point = (xi - x1) / (x2 - x1)
    y_point = (yi - y1) / (y2 - y1)
    return int(x_point * width_ratio) , int (y_point * height_ratio) 
    

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
    global detect_markers, skip_frame, aruco_dict, aruco_params
    while True:
        if detect_markers:
            ret, frame = cap.read()
            if not ret:
                continue

            # skip_frame += 1
            # if skip_frame % 2:
            #     continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            corners, ids, _ = cv2.aruco.ArucoDetector(aruco_dict, detectorParams=aruco_params).detectMarkers(gray)

            if ids is not None:
                send_detected(corners, ids, frame.shape[1])
            
            time.sleep(0.01)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        time.sleep(0.02)

@app.route('/shoot', methods=['GET'])
def shoot():
    global player1CanShoot, player2CanShoot
    player = request.args.get('player')
    shoot = request.args.get('shoot')

    if player and shoot:
        if player == 'player1':
            player1CanShoot = True
        elif player == 'player2':
            player2CanShoot = True
        return "Shoot event received", 200
    else:
        return "Invalid request", 400

def adjust_multi_player():
    global width_ratio, height_ratio, player1CanShoot, player2CanShoot
    arr1 = []
    arr2 = []
    while len(arr1) != 4:
        while not player1CanShoot: time.sleep(0.01)
        pos = detect_position('player1')
        player1CanShoot = False
        if pos:
            socketio.emit('adjustment_shot', 'player1')
            print(pos)
            arr1.append(pos)
    while len(arr2) != 4:
        while not player2CanShoot: time.sleep(0.01)
        pos = detect_position('player2')
        player2CanShoot = False
        if pos:
            print(pos)
            socketio.emit('adjustment_shot', 'player2')
            arr2.append(pos)
    print(arr2)
    print("adjusting...")
    adjust_player_box(arr1, 'player1')
    adjust_player_box(arr2, 'player2')

def adjust_single_player():
    global width_ratio, height_ratio, player1CanShoot, player2CanShoot
    arr1 = []
    k = 0
    while k != 3:
        while not (player1CanShoot or player2CanShoot): continue
        pos = detect_position('player1')
        player1CanShoot = False
        player2CanShoot = False
        arr1.append(pos)
        k+=1
    adjust_player_box(arr1, 'player1')
    adjust_player_box(arr1, 'player2')


@socketio.on('adjust-shooting')
def adjust_shooting(data):
    global width_ratio, height_ratio, player1CanShoot, player2CanShoot
    _, frame = cap.read()
    height, width = frame.shape[0:2]
    innerHeight, innerWidth = data.get("height"), data.get("width")
    width_ratio = innerWidth
    height_ratio = innerHeight
    print("Pc Width:",width, "Pc Height:", height)
    print("Inner Width:", innerWidth, "Inner Height:", innerHeight)
    print("Width Ratio:", width_ratio, "Height Ratio:", height_ratio)
    if data.get('type') == "MultiPlayer":
        print("adjusting multi player")
        adjust_multi_player()
    elif data.get('type') == 'SinglePlayer':
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