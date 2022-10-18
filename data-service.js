let students =[];
let programs =[];

const fs = require('fs');

module.exports.initialize = function(){
    return new Promise(function(resolve, reject){ 
        fs.readFile('./data/students.json','utf8',(err, data) => {
            if (err) {
                reject("unable to read students.json") ;
                return;
            }
            let studentsArr= JSON.parse(data);
            for(var i = 0; i < studentsArr.length; i++){
                students.push(studentsArr[i]); 
            }
            fs.readFile('./data/programs.json','utf8',(err, data) => {
                if (err) {
                    reject("unable to read programs.json");
                    return;
                }
                let programsArr= JSON.parse(data);
                for(var i = 0; i < programsArr.length; i++){
                    programs.push(programsArr[i]); 
                }
            })
            resolve("Files read successfully");
        })
        
    });   
}

module.exports.getAllStudents = function(){
    return new Promise(function(resolve, reject){
        if (students.length==0){
            reject("No results returned."); return;
        }
        resolve(students);
    })
}

module.exports.getInternationalStudents= function(){
    return new Promise(function(resolve, reject){
        let intlStudents = students.filter(student=>student.isInternationalStudent===true);
        if (intlStudents.length==0){
            reject("No results returned."); return;
        }
        resolve(intlStudents);
    })
}

module.exports.getStudentsByStatus= function(status){
    return new Promise(function(resolve, reject){
        let stud = students.filter(student=>student.status===status);
        if (stud.length==0){
            reject("No results returned."); return;
        }
        resolve(stud);
    })
}

module.exports.getStudentsByProgramCode= function(programCode){
    return new Promise(function(resolve, reject){
        let stud = students.filter(student=>student.program===programCode);
        if (stud.length==0){
            reject("No results returned."); return;
        }
        resolve(stud);
    })
}

module.exports.getStudentsByExpectedCredential= function(credential){
    return new Promise(function(resolve, reject){
        let stud = students.filter(student=>student.expectedCredential===credential);
        if (stud.length==0){
            reject("No results returned."); return;
        }
        resolve(stud);
    })
}

module.exports.getStudentById= function(Id){
    return new Promise(function(resolve, reject){
        let stud = students.filter(student=>student.studentID===Id);
        if (stud.length==0){
            reject("No results returned."); return;
        }
        resolve(stud[0]);
    })
}


module.exports.getPrograms= function(){
    return new Promise(function(resolve, reject){
        if (programs.length==0){
            reject("No results returned."); return;
        }
        resolve(programs);
    })
}

module.exports.addStudent = function(studentData){    //studentData=req.body 
    return new Promise(function(resolve, reject){
        if (!studentData.isInternationalStudent){
            studentData.isInternationalStudent =false;
        }else{
            studentData.isInternationalStudent =true;
        }

        //sort students array by highest studentID value first (descending order)
        let sortedArr= students.sort(function(s1, s2){ 
            return Number(s2.studentID)-Number(s1.studentID);})
        
        let newID = Number(sortedArr[0].studentID) +1;
        studentData.studentID= newID.toString();
        
        //push new student object to students array
        students.push(studentData);
        resolve();
    })
}

module.exports.updateStudent= function(studentData){ //studentData is the form info passed in 
    return new Promise(function(resolve, reject){
        let studIndex = students.findIndex(student=>student.studentID===studentData.studentID);
        //if student found, update that student's data in the students array
        if (studIndex>-1){
            if (!studentData.isInternationalStudent){
                studentData.isInternationalStudent =false;
            }else{
                studentData.isInternationalStudent =true;
            }
            students[studIndex]= studentData;
            resolve(); return;
        }
        reject("No student with the student Id was found.");
    })
}
