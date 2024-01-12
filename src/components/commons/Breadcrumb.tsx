import { useEffect } from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

interface Props {
    page: {title:string, url:string}[]
}

function BreadcrumbMission(props: Props) {

   useEffect(() =>{
        console.log(props.page.length)
   },[]) 

  return (
    <Breadcrumb className='my-5'>
    {props.page.map((p, i) => (
        <Breadcrumb.Item key={i} active={!!(props.page.length -1 === i)} href={p.url}>{p.title}</Breadcrumb.Item>
    ))}
    </Breadcrumb>
  );
}

export default BreadcrumbMission;