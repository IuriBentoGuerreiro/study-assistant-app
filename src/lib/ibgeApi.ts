import axios from "axios";

export const ibgeApi = axios.create({
  baseURL: "https://servicodados.ibge.gov.br/api/v1/localidades",
  timeout: 10000,
});