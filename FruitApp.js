import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const App = () => {
  const [result, setResult] = useState(null);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }
  
    let pickerResult = await ImagePicker.launchImageLibraryAsync();
  
    console.log('Picker Result:', pickerResult);
  
    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
      console.log(`Selected image URI: ${pickerResult.assets[0].uri}`);
      setSelectedImageUri(pickerResult.assets[0].uri);
      classifyImage(pickerResult.assets[0].uri);
    } else {
      console.log('No image selected or URI is undefined');
    }
  };
  
  const classifyImage = async (imageUri) => {
    let formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    console.log('Fetching data...');
    try {
      let response = await fetch('http://192.168.101.184:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Network response was not ok');
        return;
      }

      let result = await response.json();
      console.log('Data fetched successfully:', result);
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
    }
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FruitScan</Text>
      </View>
      <Text style={styles.headerSubtitle}>A smart platform for fruit leaf disease prediction</Text>
      {result && (
        <View style={styles.resultContainer}>
          {selectedImageUri && (
            <Image source={{ uri: selectedImageUri }} style={styles.image} />
          )}
          <Text style={styles.resultText}>Fruit: {result.fruit}</Text>
          <Text style={styles.resultText}>Class: {result.class}</Text>
          <Text style={styles.resultText}>Confidence: {result.confidence.toFixed(2)}</Text>
        </View>
      )}
      <Button title="Pick Image" onPress={pickImage} style={styles.button} />
      <Text style={styles.note}>*Upload the fruit leaf image</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF0',
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: '#000',
    marginTop: 25,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '120%',
    position: 'absolute',
    top: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },  
  headerSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    position: 'absolute',
    top: 100,
    color: 'red',
    textAlign: 'center',
    // width: '103%',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#FFF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  resultContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    top: 40,
    marginBottom: 60,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  resultTextContainer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
});


export default App;
