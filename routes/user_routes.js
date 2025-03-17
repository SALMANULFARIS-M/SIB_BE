import express from 'express';
import {  apply, counceling, contact,latestBlogs } from '../controllers/user_controller.js';
import { getBlogBySlug, listBlogs } from '../controllers/common_controller.js';

const router = express.Router();

// Application and counseling routes
router.post('/apply', apply); // Submit application
router.post('/counseling',  counceling); // Submit counseling request

// Contact route
router.post('/contact',  contact); // Submit contact form

// Blog routes
router.get('/blog/:slug', getBlogBySlug); // Get blog by slug
router.get('/blogs', listBlogs); // List all blogs
router.get('/latestblogs', latestBlogs); // List all blogs


export default router;