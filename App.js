import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { TextInput } from 'react-native-paper';

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
  useEffect(() => {
    fetch(
      `https://api.opencagedata.com/geocode/v1/json?key=ad3b7da594ad4a239eb32622118085e1&q=${lat}+${lng}`,
    )
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        setDataJson(json);
      });
  }, [lng]);

  useEffect(() => {
    fetch(`https://api.exchangeratesapi.io/latest?base=USD&symbols=${code}`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        setCurrency(json);
      });
  }, [code]);

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
    <View style={styles.container}>
      <Text style={{ fontSize: 23 }}>
        Welcome to {city}, {country}
      </Text>
      <Text> Current weather {temperature}</Text>
      <TextInput label="usd" onChangeText={(amount) => setUsd(amount * rate)} />
      <TextInput
        label="localCurrency"
        onChangeText={(amount) => setLocal(amount / rate)}
      />
      <Text>
        {usd.toFixed(2)} {code}
      </Text>
      <Text>{local.toFixed(2)} USD</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
