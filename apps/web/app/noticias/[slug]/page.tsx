'use client';
import {useParams} from 'next/navigation';
import {Detail} from '../../Listing';
export default function NewsDetail(){const p=useParams<{slug:string}>();return <Detail type="news" slug={p.slug}/>}
