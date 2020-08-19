## Image Upload Util

#### ABOUT:
* (Coming soon...)

#### App Init Description:
* Clone this repository
* Create `.env` file at application root and assign key/value pairs for AWS S3 account.
* Install dependencies via `npm install` cmd.
  - The `npm install --unsafe-perm` flag must be used when installing as root or a sudo user.
  - The `npm install --ignore-scripts=false` flag must be used when npm has been configured to ignore installation scripts.
* Start application via &nbsp;`npm run start`&nbsp; cmd

#### App Init Summary:
```
image-upload-util$ vim .env (assign key/value pairs for AWS S3 account)
image-upload-util$ npm install
image-upload-util$ npm run start
```

#### App Init Troubleshooting:
* [Sharp Install](https://sharp.pixelplumbing.com/install)

#### .env
- AWS_ACCESS_KEY_ID=
- AWS_SECRET_ACCESS_KEY=
- AWS_REGION=
- AWS_BUCKET_NAME=
- AWS_USERNAME=
- AWS_PASSWORD=

###### INDEV Tasks
* Add "size=" value to filename naming convention [TODO]
  - WCS_Controller will ping the api 'listObjects' route and determine variations following 'size='
* S3_Image.xml --> remove all unneccessary fields, update controller code to ping API [TODO]
* Add "size" picklist to templates (below GIA_Image dropzones) [TODO]
* Validation on title/filename prior to "upload": [TODO]
 - no chinese or japanese chars
 - no alphanumeric
 - no special chars used by S3 filename naming convention (eg: '/' or '~')
* On image deletion force deletion on all 4 variations [TODO]
* Mongodb to hold key/pair or metadata for each successful s3 upload (on response) [TODO]
* Push repo to bitbucket [DONE]