import { replaceInFile } from 'replace-in-file';

const options = {
  files: 'build/**/*.js', // Make sure this matches the output files location
  from: /http:\/\/localhost:5000/g,
  to: 'https://ruling-liberal-kitten.ngrok-free.app',
};

replaceInFile(options)
  .then(results => {
    console.log('Replacement results:', results);
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });