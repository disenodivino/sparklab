import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

export default function FAQ() {
  return (
    <div className='container mx-auto px-4 py-20 lg:py-32' id='faq'>
      <h2 className='text-4xl font-headline mb-6'>Frequently Asked Questions</h2>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='item-1'>
            <AccordionTrigger className='hover:cursor-none'>What is SparkLab 2025?</AccordionTrigger>
            <AccordionContent>
              <p>SparkLab 2025 is a 30-hour national-level product design challenge where students collaborate to solve real-world problems through innovation, design thinking, and rapid prototyping.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
            <AccordionTrigger className='hover:cursor-none'>Who can participate?</AccordionTrigger>
            <AccordionContent>
              <p>Students from engineering, design, and management backgrounds are welcome to participate. Both undergraduate and postgraduate students can apply — individually or as a team.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-3'>
            <AccordionTrigger className='hover:cursor-none'>How many members can be in a team?</AccordionTrigger>
            <AccordionContent>
              <p>Each team can have 1 to 4 members. Cross-disciplinary teams are encouraged for better creativity and diversity of ideas.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-4'>
            <AccordionTrigger className='hover:cursor-none'>How do I register?</AccordionTrigger>
            <AccordionContent>
              <p>Registrations are open via the Unstop platform. Teams must fill out the application form and submit a brief portfolio or design idea as part of the selection process.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-5'>
            <AccordionTrigger className='hover:cursor-none'>Is there any registration fee?</AccordionTrigger>
            <AccordionContent>  
                <p>Yes. The fee is ₹199 per team (or ₹149 for ISTE members) only for shortlisted teams.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-6'>
            <AccordionTrigger className='hover:cursor-none'>What are the event dates and venue?</AccordionTrigger>
            <AccordionContent>
                <p>24th & 25th October 2025 at Nitte Meenakshi Institute of Technology, Bangalore.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-7'>
            <AccordionTrigger className='hover:cursor-none'>What will participants get?</AccordionTrigger>
            <AccordionContent>
                <ul>
                    <li>Certificates of participation</li>
                    <li>Networking with industry mentors</li>
                    <li>Hands-on experience solving real design problems</li>
                    <li>Exciting prizes from a total pool of ₹40,000</li>
                    <li>A chance to get your idea supported or patented by NMIT</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-8'>
            <AccordionTrigger className='hover:cursor-none'>What are the event themes?</AccordionTrigger>
            <AccordionContent>
                <p>SparkLab focuses on impact-driven challenges in areas:</p>
                <p>Themes will be revealed on event day.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-9'>
            <AccordionTrigger className='hover:cursor-none'>Are meals and accommodation provided?</AccordionTrigger>
            <AccordionContent>
                <p>Yes. All registered participants will be provided with meals, snacks, and rest zones throughout the 30-hour challenge.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-10'>
            <AccordionTrigger className='hover:cursor-none'>Do participants retain rights to their projects?</AccordionTrigger>
            <AccordionContent>
                <p>Yes. Teams retain full intellectual property rights to their ideas and designs. NMIT may assist in patent filing or incubation for promising solutions.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  )
}
