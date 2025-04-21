// app/lib/services/trawexApi.ts

import axios from "axios";

// This endpoint is your backend, not Trawex directly.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const trawexApi = {
  async getAirports(searchTerm: string) {
    const response = await axios.get(`${BASE_URL}/flights/airports`, {
      params: { q: searchTerm }
    });
    return response;
  },
  // Similarly, other methods (search flights, book flight, etc.)
};

export default trawexApi;
