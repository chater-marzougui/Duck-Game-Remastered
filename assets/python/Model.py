import cv2
import numpy as np

def preprocess_frame(frame, blur_ksize, threshold_value):
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (blur_ksize, blur_ksize), 0)
    
    # Apply a threshold to get the brightest spots
    _, thresh = cv2.threshold(blurred, threshold_value, 255, cv2.THRESH_BINARY)
    
    return thresh

def detect_light(thresh):
    # Find contours of the bright spot
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Get the largest contour
        largest_contour = max(contours, key=cv2.contourArea)
        (x, y, w, h) = cv2.boundingRect(largest_contour)
        
        # Return the coordinates of the center of the contour
        return (x + w // 2, y + h // 2)
    
    return None

def get_light_coordinates(frame, blur_ksize, threshold_value):
    # Preprocess the frame
    thresh = preprocess_frame(frame, blur_ksize, threshold_value)
    
    # Detect the light
    coordinates = detect_light(thresh)
    
    return coordinates

def nothing(x):
    pass

# Initialize camera
cap = cv2.VideoCapture(0)

# Create a window
cv2.namedWindow('Frame')

# Create trackbar for adjusting blur kernel size and threshold value
cv2.createTrackbar('Blur', 'Frame', 15, 50, nothing)
cv2.createTrackbar('Threshold', 'Frame', 200, 255, nothing)

while True:
    # Capture frame-by-frame
    ret, frame = cap.read()
    
    # Get current positions of the trackbar
    blur_ksize = cv2.getTrackbarPos('Blur', 'Frame')
    threshold_value = cv2.getTrackbarPos('Threshold', 'Frame')
    
    # Ensure blur kernel size is odd and greater than 1
    if blur_ksize % 2 == 0:
        blur_ksize += 1
    if blur_ksize < 1:
        blur_ksize = 1
    
    # Get light coordinates
    coordinates = get_light_coordinates(frame, blur_ksize, threshold_value)
    preprocessed_frame = preprocess_frame(frame, blur_ksize, threshold_value)
    
    if coordinates:
        x, y = coordinates
        # Draw a circle at the detected coordinates
        cv2.circle(frame, (x, y), 10, (0, 255, 0), 2)
        print(f"Detected coordinates: ({x}, {y})")
    
    # Display the resulting frame
    cv2.imshow('Frame', frame)
    cv2.imshow('Preprocessed Frame', preprocessed_frame)
    
    # Break the loop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# When everything is done, release the capture
cap.release()
cv2.destroyAllWindows()