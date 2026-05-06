import face_recognition
import numpy as np
import json

def get_face_embedding(image_path: str):
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return None

    return encodings[0].tolist()


def compare_embeddings(known_embeddings, test_embedding):
    known = [np.array(e) for e in known_embeddings]
    test = np.array(test_embedding)

    results = face_recognition.compare_faces(known, test, tolerance=0.5)
    return results

def find_best_match(known_embeddings, test_embedding):
    import numpy as np
    import face_recognition

    known = [np.array(e) for e in known_embeddings]
    test = np.array(test_embedding)

    distances = face_recognition.face_distance(known, test)

    if len(distances) == 0:
        return None

    best_match_index = np.argmin(distances)

    
    if distances[best_match_index] < 0.5:
        return best_match_index

    return None