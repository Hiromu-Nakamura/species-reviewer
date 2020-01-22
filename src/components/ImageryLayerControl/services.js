import axios from "axios";
import config from './config.json';

export const saveFeature = ({
    UserID = '',
    Cutecode = '',
    Threshold = 0,
    Comment = '',
    token = ''
}={})=>{

    const requestUrl = config["threshold-feature-table"].url + '/addFeatures';

    const feature = {
        attributes: {
            UserID, Cutecode, Threshold, Comment
        }
    };

    const bodyFormData = new FormData();
    bodyFormData.append("features", JSON.stringify(feature));
    bodyFormData.append("rollbackOnFailure", false);
    bodyFormData.append("f", "json");
    bodyFormData.append("token", token);

    return new Promise((resolve, reject) => {
      axios
        .post(requestUrl, bodyFormData)
        .then(function(response) {
          console.log(response);
          resolve(response);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
};
