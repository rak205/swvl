## How to Deploy the Project?
1. Clone the project and move into root directory
2. `npm install`
3. `npm start` 
- - - -

## Overview
* This app is built in React using react-google-maps and react-google-charts. 
* Although it is not recomended to commit `.env` file. My Google API's key is present in `.env` file therefore I commited it for enduser easiness. 
* I have used inline styling in components due to time constraint, though it is not recommended. 
* Bus stops at each station for 5 seconds, updates the state and the move on to next stop.
* I save the driver's locatiion in localStorage at the end of the ride.
* To calculate the rotation of vehicle image, I have used `google.maps.geometry`. 
