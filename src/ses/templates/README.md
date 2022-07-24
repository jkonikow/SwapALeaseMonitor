### SES Template HTML

This directory contains the html file which represents the email to be sent for finding new listings. SES however requires that the html to be used is submitted via the `create template` api as valid json. What this means is that the html cannot contain line breaks and special chars must be escaped. 

Because of this wheh the html file is updated the json in template.json must be updated along with it. 

to update 

* visit https://www.freeformatter.com/json-escape.html 
* copy the contents of the html file and click "escape Json". This returned string should now be used in the HTML section of the template