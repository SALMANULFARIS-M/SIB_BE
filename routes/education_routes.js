import express from 'express';
import { addUniversity, deleteUniversity, getUniversities, getUniversitiesIds, getUniversityWithColleges, updateUniversity } from '../controllers/university_controller.js';
import { addCollege, deleteCollege, getCollegeById, getColleges, getCollegesIds, updateCollege } from '../controllers/college_controller.js';
import { addCourse, deleteCourse, getCourses, getCourseById, getCoursesIds, updateCourse } from '../controllers/course_controller.js';
import upload from "../middleware/upload.js";

const router = express.Router();


//universities
router.get('/universities',getUniversities);
router.get("/university/:id", updateUniversity);
router.get('/universities-ids',getUniversitiesIds);
router.get('/collegesUnderUniversites/:id',getUniversityWithColleges);
router.post("/university",upload.single("logo"), addUniversity);
router.put("/university/:id",upload.single("logo"), updateUniversity);
router.delete("/university/:id", deleteUniversity);


//college 
router.get('/colleges',getColleges);
router.get('/college-ids',getCollegesIds);
router.get('/college/:id',getCollegeById)
router.post("/college", upload.array('photos', 3), addCollege);
router.put("/college/:id",upload.array('photos', 3), updateCollege);
router.delete("/college/:id", deleteCollege);

//course
router.get('/courses',getCourses);
router.get('/course-ids', getCoursesIds);
router.get('/course/:id',getCourseById);
router.post("/course", addCourse);
router.put("/course/:id", updateCourse);
router.delete("/course/:id", deleteCourse);



export default router;

