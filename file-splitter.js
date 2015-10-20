var fs = require('fs');
var split = require('split');
var through2 = require('through2');

var fileName = process.argv[2];
var file = fs.createReadStream(fileName);
var fileNameExt = fileName.split('.')[fileName.split('.').length -1];

var currentlyCollecting = false;
var outputFileName = '';
var outputLines = [];

file
    .pipe(split())
    .pipe(through2(
        {objectMode: true},
        function (lineChars, _, next){
            var line = lineChars.toString();
            if (line) {
                currentlyCollecting = true;
                outputLines.push(line);
                if (line.substring(0,4) === 'var ') {
                    outputFileName = line.split(' ')[1];
                }
            } else {
                if (currentlyCollecting) {
                    currentlyCollecting = false;
                    this.push({
                        fileName: outputFileName,
                        content: outputLines.join('\n') + '\n'
                    });
                    outputLines = [];
                }
            }
            next();
        },
        function (next) {
            if (currentlyCollecting) {
                this.push({
                    fileName: outputFileName,
                    content: outputLines.join('\n') + '\n'
                });
            }
            next();
        }
    ))
    .on('data', function (obj) {
        fs.writeFileSync(obj.fileName + '.' + fileNameExt, obj.content);
    });
