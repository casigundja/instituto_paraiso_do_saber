'use client';
import {useParams} from 'next/navigation';
import {Detail} from '../../Listing';
export default function EventDetail(){const p=useParams<{slug:string}>();return <Detail type="events" slug={p.slug}/>}
