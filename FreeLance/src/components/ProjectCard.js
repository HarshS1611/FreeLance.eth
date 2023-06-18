import Image from 'next/image'
import Link from 'next/link'
import { FaStar } from "react-icons/fa";
export default function ProjectCard({ project }) {

    console.log(project.image)
    console.log(project.duration)
    return (
        <Link href={`/viewproject/${project.id}`}>
            <div className="flex py-7 px-3 border-2 border-slate-700 rounded-xl m-5 cursor-pointer hover:opacity-80 hover:shadow-lg hover:bg-zinc-700 pr-4 transition duration-500 ease-in hover:border-none">
                {/* Just for image div-LHS */}
                <div className="relative h-24 w-40 md:h-52 md:w-80 flex-shrink-0">
                    <Image src={project.image} alt="img" layout="fill" objectFit="cover" className="rounded-2xl" />
                </div>
                {/* Content div-RHS */}
                <div className='flex flex-col flex-grow pl-5'>
                    <h4 className="text-2xl font-bold">{project.title}</h4>
                    <div className="border-b w-10 pt-2" />
                    <p className="pt-2 text-lg text-white flex-grow">{project.description}</p>
                    {/* Display project rating based on the taskCount  */}
                    {/* If there are 2 tasks, then 2 stars */}
                    {/* If there are 4 tasks, then 4 stars */}
                    {/* If there are 6 tasks, then 6 stars */}
                    {/* If there are 8 tasks, then 8 stars */}
                    <div className="flex items-center">
                        <h5 className="text-lg font-semibold">Rating: &nbsp;</h5>
                        {
                            Array(project.taskCount)
                                .fill()
                                .map((_, i) => (
                                    <FaStar className="h-5 text-white" />
                                ))
                        }
                    </div>
                    {/* Price div */}
                    <div className="flex justify-between items-end pt-5">
                        <span className="flex items-center rounded-xl bg-slate-700 px-2 py-1">
                            {/* <StarIcon className="h-5 text-red-400" /> */}
                            {
                                project.category
                            }
                        </span>
                        <div>
                            <p className="text-lg lg:text-2xl font-semibold pb-2">price</p>
                            <p className="text-right font-extralight">total</p>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

