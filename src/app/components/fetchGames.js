import axios from 'axios';

function fetchGames() {
  axios.get('http://localhost:3001/games')
    .then(response => {
      const games = response.data;
      console.log(games);
    })
    .catch(error => {
      console.log(error);
    });
}


export default fetchGames;
