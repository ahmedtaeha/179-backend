const catchAsync =  require("../utils/catchAsync");
const axios = require( "axios");

const getByKeyword = catchAsync(async (req, res) => {
  const { keyWord } = req.body;
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url:
      "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=" +
      keyWord +
      "&key=" +
      process.env.GOOGLE_API_KEY,
    headers: {},
  };

  axios
    .request(config)
    .then((response) => {
      console.log("response", response.data.predictions);
      return res.status(200).json({
        status: "success",
        data: response.data,
      });
    })
    .catch((error) => {
      return res.status(400).json({
        status: "error",
        data: null,
      });
    });
});

const getByID = catchAsync(async (req, res) => {

  const { place_id} = req.body;

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=geometry&key=${process.env.GOOGLE_API_KEY}`,
      headers: {},
    };

    axios
      .request(config)
      .then((response) => {
        return res.status(200).json({
          status: "success",
          data: response.data,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          status: "error",
          data: null,
        });
      });

        
})


module.exports = {
  getByKeyword,getByID
}