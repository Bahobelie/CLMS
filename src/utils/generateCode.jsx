import axios from 'axios';


const generateCode = async (model,prefix) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const labTestCode = await axios.get(`${apiUrl}/model/next-code`, {
    params: {
      model: model,
      prefix: prefix
    }
  });
  return labTestCode.data.code;
}
export default generateCode;