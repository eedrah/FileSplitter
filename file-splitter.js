var fs = require('fs');
var split = require('split');
var through2 = require('through2');

var fileName = process.argv[2];
var file = fs.createReadStream(fileName);
var fileNameExt = fileName.split('.')[fileName.split('.').length -1];

var outputFileName = '';
var outputLines = [];

file
    .pipe(split())
    .pipe(through2(
        {objectMode: true},
        function (lineChars, _, next){
            var line = lineChars.toString();
            if (line && line.substring(0,4) === 'var ') {
                this.push({
                    fileName: outputFileName,
                    content: outputLines.join('\n') + '\n'
                });

                outputFileName = line.split(' ')[1];
                outputLines = [];
            }
            outputLines.push(line);
            next();
        },
        function (next) {
            this.push({
                fileName: outputFileName,
                content: outputLines.join('\n') + '\n'
            });
            next();
        }
    ))
    .on('data', function (obj) {
        fs.writeFileSync(obj.fileName + '.' + fileNameExt, obj.content);
    });
