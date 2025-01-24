import axios from "axios";

const instance = axios.create({
  baseURL: "https://alex.polan.sk/guess_the_way/",
  timeout: 10000,
});

export default instance;