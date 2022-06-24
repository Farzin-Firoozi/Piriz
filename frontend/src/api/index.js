import axios from "axios";

const BASE_URL = "http://localhost:8000";

const client = axios.create({ baseURL: BASE_URL });

export const getInfo = () => {
  return client.get("/info");
};

export const sendInfo = (data) => {
  return client.post("/info", data);
};

export const getTemperatures = () => {
  return client.get("/temperatures");
};
