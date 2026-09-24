'use client';
import {useParams} from 'next/navigation';
import {Detail} from '../../Listing';
export default function CourseDetail(){const p=useParams<{slug:string}>();return <Detail type="courses" slug={p.slug}/>}
