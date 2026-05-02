import face_recognition

img = face_recognition.load_image_file("test.jpg")
encodings = face_recognition.face_encodings(img)

print(len(encodings))