import cv2
import numpy as np

# Load the ArUco dictionary
aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_6X6_250)
aruco_params = cv2.aruco.DetectorParameters()

# Initialize the camera
cap = cv2.VideoCapture(0)

# Reduce frame resolution for faster processing
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

frame_counter = 0

while True:
    frame_counter += 1
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    if not ret:
        break

    if frame_counter % 2 != 0:
        if frame_counter == 100:
            frame_counter = 0
        continue
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect ArUco markers
    corners, ids, rejected = cv2.aruco.ArucoDetector(aruco_dict, detectorParams=aruco_params).detectMarkers(gray)
    frame = cv2.flip(frame, 1)
    width = frame.shape[1]
    # If markers are detected
    if ids is not None:
        # Draw the detected markers
        cv2.aruco.drawDetectedMarkers(frame, corners, ids)

        # Extract the position of the marker
        for corner in corners:
            # Calculate the center of the marker
            center = tuple(np.mean(corner[0], axis=0).astype(int))
            # Draw the center on the frame
            cv2.circle(frame, (width - center[0], center[1]), 5, (0, 255, 0), -1)
            print("Marker position:", center)

    # Display the resulting frame
    cv2.imshow('frame', frame)

    # Break the loop on 'q' key press
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture and close windows
cap.release()
cv2.destroyAllWindows()
