import express from 'express';
import { addUniversity, deleteUniversity, getUniversities, getUniversityWithColleges, updateUniversity } from '../controllers/university_controller';
import { addCollege, deleteCollege, getCollegeById, getColleges, updateCollege } from '../controllers/college_controller';
import { addCourse, deleteCourse, getCourses, getCoursesById, updateCourse } from '../controllers/course_controller';
import upload from "../middleware/upload.js";



//universities
router.get('/universities',getUniversities);
router.get('/collegesUnderUniversites/:id',getUniversityWithColleges);
router.post("/university",upload.single("logo"), addUniversity);
router.put("/university/:id", updateUniversity);
router.delete("/university/:id", deleteUniversity);

//college 
router.get('/colleges',getColleges);
router.get('/college/Id',getCollegeById);
router.post("/college", addCollege);
router.put("/college/:id", updateCollege);
router.delete("/college/:id", deleteCollege);

//course
router.get('/courses',getCourses);
router.get('/course/Id',getCoursesById);
router.post("/course", addCourse);
router.put("/course/:id", updateCourse);
router.delete("/course/:id", deleteCourse);



export default router;





const router = express.Router();
