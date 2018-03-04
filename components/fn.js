fn = function(req, res) {
    let fs = require('fs');



    fs.readFile(req.files.upload.path, function (err, data) {

        let structure_path = req.url.split('?CKEditor=').pop().split('&CKE').shift();

        let newPath = __dirname + '/../public/uploads/' + structure_path + '/' + req.files.upload.name;
        fs.writeFile(newPath, data, function (err) {
            if (err) console.log({err: err});
            else {
                html = "";
                html += "<script type='text/javascript'>";
                html += "    var funcNum = " + req.query.CKEditorFuncNum + ";";
                html += "    var url     = \"/uploads/" + structure_path + "/" + req.files.upload.name + "\";";
                html += "    var message = \"Uploaded file successfully\";";
                html += "";
                html += "    window.parent.CKEDITOR.tools.callFunction(funcNum, url, message);";
                html += "</script>";

                res.send(html);
            }
        });
    });
};

module.exports = fn;