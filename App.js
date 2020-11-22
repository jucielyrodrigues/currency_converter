import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { TextInput, Appbar, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  let [lat, setLat] = useState(null);
  let [lng, setLng] = useState(null);
  let [dataJson, setDataJson] = useState('');
  let [currency, setCurrency] = useState('');
  let [weather, setWeather] = useState('');
  let [usd, setUsd] = useState(0);
  let [local, setLocal] = useState(0);

  let city = dataJson && dataJson.results[0].components.city;
  let country = dataJson && dataJson.results[0].components.country;
  let code = dataJson && dataJson.results[0].annotations.currency.iso_code;
  let conversion = currency && currency.rates;
  let rate = conversion && conversion[Object.keys(conversion)[0]];

  const [myLocals, setLocals] = React.useState(false);

  //FUNCTION TO SAVE DATA
  const saveData = async () => {
    try {
      let values = {
        city: city,
        country: country,
        temperature: temperature,
        rate: rate,
      };
      await AsyncStorage.setItem('values', JSON.stringify(values));
      let places = JSON.parse(await AsyncStorage.getItem('places')) || [];
      places.push(values);
      await AsyncStorage.setItem('places', JSON.stringify(places));
      showData();
    } catch (e) {
      console.log(e);
    }
  };
  // FUNCTION TO SHOW DATA
  const showData = async () => {
    let locations =
      (await AsyncStorage.getItem('places')) &&
      JSON.parse(await AsyncStorage.getItem('places'));
    setLocals(locations);
  };

  //USEeFFECT TO TRIGGER TO SHOW DATA WHEN THE APP INITIALIZE
  React.useEffect(() => {
    showData();
  }, []);
  console.log(myLocals);
  //FUNCTION TO GET LAT AND LNG
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude);
      setLng(location.coords.longitude);
    })();
  }, []);

  // API OPENCAGE TO FETCH CURENT PLACE DATA
  useEffect(() => {
    if (lat && lng)
      fetch(
        `https://api.opencagedata.com/geocode/v1/json?key=ad3b7da594ad4a239eb32622118085e1&q=${lat}+${lng}`,
      )
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          setDataJson(json);
        });
  }, [lat, lng]);

  //API TO FECTH THE CURRENCY OF THE COUNTRY
  useEffect(() => {
    fetch(`https://api.exchangeratesapi.io/latest?base=USD&symbols=${code}`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        setCurrency(json);
      });
  }, [code]);

  //API OPEN WEATHER TO FECTH THE WEATHER INFO
  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=c3529f95d443c81bd2c1e46267bb7ee3`,
    )
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        setWeather(json);
      });
  }, [lat, lng]);

  let temperature = weather.cod == 200 && weather.main.temp;
  console.log(temperature);
  console.log(rate);

  return (
    <View>
      {/*HEADER*/}
      <Appbar.Header>
        <Appbar.Content
          style={{ textAlign: 'center' }}
          title="Currency Converter"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Text style={{ fontSize: 23 }}>
          {/*RENDER THE CITY AND COUNTRY ON APP*/}
          Welcome to {city}, {country}
        </Text>
        {/*RENDER THE WEATHER ON APP*/}
        <Text> Current weather: {temperature} Degrees</Text>
        {/* RENDER THE CONVERSION LOCAL CURRENCY TO USD*/}
        <TextInput
          // GRAB THE AMOUNT TO CONVERTER USD TO LOCAL CURRENCY
          label="usd"
          onChangeText={(amount) => setUsd(amount * rate)}
        />
        {/* GRAB THE AMOUNT TO CONVERTER LOCAL CURRENCY TO USD*/}
        <TextInput
          label="localCurrency"
          onChangeText={(amount) => setLocal(amount / rate)}
        />
        {/* RENDER THE CONVERSION USD TO LOCAL CURRENCY*/}
        <Text>
          {usd.toFixed(2)} {code}
        </Text>
        {/*RENDER THE CONVERSION LOCAL CURRENCY TO USD*/}
        <Text>{local.toFixed(2)} USD</Text>
        <StatusBar style="auto" />
      </View>
      {/*Button to save Data*/}
      <Button mode="contained" onPress={saveData}>
        Save Data
      </Button>
      {myLocals &&
        myLocals.map((item, index) => (
          <View key={index}>
            <Text>
              City: {item.city}, Country: {item.country}, Weather:
              {parseInt(item.temperature)}
            </Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});
