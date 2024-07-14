import cv2

aruco = cv2.aruco.DICT_6X6_250

# Define the dictionary and parameters
aruco_dict = cv2.aruco.getPredefinedDictionary(aruco)
aruco_params = cv2.aruco.DetectorParameters()

# Generate the marker
marker_image = cv2.aruco.generateImageMarker(aruco_dict, id=12, sidePixels=200)

# Save the marker image
cv2.imwrite("aruco_marker2.png", marker_image)