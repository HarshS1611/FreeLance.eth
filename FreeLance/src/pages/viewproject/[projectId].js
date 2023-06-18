import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Head from "next/head";
import Link from "next/link";
import { ethers } from "ethers";
import { contractAddress } from "../../../blockchain/config";
import JobPortal from "../../../blockchain/artifacts/contracts/JobPortal.sol/JobPortal.json";
import Web3Modal from "web3modal";
import axios from "axios";
import TaskCard from "@/components/TaskCard";

import { Polybase } from "@polybase/client";

const db = new Polybase({
  defaultNamespace:
    "pk/0x81c580282b4a4d717abbe5609c8d4af106783559f0dd7caa481255a833dfd790cd88723a3ecde173c97ed3fb80be31ccaf85fd50552254b96efc686cace10993/FreeLance",
});
const collectionReference = db.collection("Task");
const projectCollectionReference = db.collection("Project");

const ProjectInfo = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const [projectData, setProjectData] = useState([]);
  const [tasks, setTasks] = useState([]);

  async function checkAvailable(filteredTasks, jobPortal, signer) {
    for (let i = 0; i < filteredTasks.length; i++) {
      let task = filteredTasks[i];
      const proposals = await jobPortal.getProposalsByTaskId(
        projectId,
        task.Id
      );
      console.log(proposals);
      proposals.forEach(async (proposal) => {
        if (proposal[3] === (await signer.getAddress())) {
          task.isAvailable = false;
        }
      });
    }
    return filteredTasks;
  }

  async function getJobportalandSigner() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const jobPortal = new ethers.Contract(
      contractAddress,
      JobPortal.abi,
      signer
    );
    getTasks(jobPortal, signer);
    getProject(jobPortal, signer);
  }

  async function getTasks(jobPortal, signer) {
    console.log("tasks");
    let tasksArr = [];

    const cnt = await jobPortal.getTaskCountByProjectId(projectId);
    for (let i = 0; i <= cnt.toNumber(); i++) {
      tasksArr.push(i);
    }

    const data = await Promise.all(
      tasksArr.map(async (t) => {
        const task = await jobPortal.getTaskData(projectId, t);
        let dbfetch;
        try {
          dbfetch = await collectionReference.record(task[0]).get();
          console.log(JSON.stringify(dbfetch.data));
          const taskObj = {
            uri: task[0],
            Id: task[1].toNumber(),
            stakedAmount: task[2].toNumber(),
            proposalCount: task[3].toNumber(),
            worker: task[4],
            isComplete: task[5],
            isReviewed: task[6],
            isAvailable: true,
            onGoing: task[7],
            taskName: dbfetch.data.taskName,
            taskDescription: dbfetch.data.taskDescription,
            taskDuration: dbfetch.data.taskDuration,
          };
          return taskObj;
        } catch (error) {
          console.log(error);
        }
      })
    );
    // filter out undefined tasks

    let filteredTasks = data.filter((task) => task !== undefined);

    filteredTasks = await checkAvailable(filteredTasks, jobPortal, signer);
    console.log(filteredTasks);
    setTasks(filteredTasks);
  }

  // Get a project by its id
  // Get all tasks for that project
  // Display all tasks
  async function getProject(jobPortal, signer) {
    console.log("project");
    const project = await jobPortal.projects(projectId);
    console.log("proj" + project);
    let dbfetch;
    try {
      dbfetch = await projectCollectionReference.record(project[0]).get();
      console.log(JSON.stringify(dbfetch.data));
      const projectObj = {
        uri: project[0],
        id: project[1].toNumber(),
        manager: project[2],
        taskCount: project[3].toNumber(),
        title: dbfetch.data.title,
        skills: dbfetch.data.skills,
        image: dbfetch.data.image,
        duration: dbfetch.data.duration,
        description: dbfetch.data.description,
        category: dbfetch.data.category,
      };
      console.log(projectObj);
      setProjectData(projectObj);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getJobportalandSigner();
  }, []);

  return (
    <>
      <Head>
        <title>FreeLance</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <section className="bg-black text-white pb-6 px-10">
        <h1 className="text-2xl font-bold my-2 md:ml-2">Project Info</h1>
        <div className="bg-[#1a1e27] rounded-xl p-5 mt-5">
          <div className="flex flex-col md:flex-row my-2">
            <h3 className="text-lg font-semibold md:ml-2">Name:</h3>

            <p className="text-sm md:ml-2 mt-1">{projectData.title}</p>
          </div>
          <div className="flex flex-col md:flex-row my-2">
            <h3 className="text-lg font-semibold md:ml-2">Description:</h3>

            <p className="text-sm md:ml-2 mt-1">{projectData.description}</p>
          </div>
          <div className="flex flex-col md:flex-row my-2">
            <h3 className="text-lg font-semibold md:ml-2">Category:</h3>

            <p className="text-sm md:ml-2 mt-1">{projectData.category}</p>
          </div>
          <div className="flex flex-col md:flex-row my-2">
            <h3 className="text-lg font-semibold md:ml-2">Skills:</h3>

            <p className="text-sm md:ml-2 mt-1">{projectData.skills}</p>
          </div>
        </div>
        <h1 className="text-2xl font-bold my-2 md:ml-2">Tasks</h1>
        {tasks.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#0284c7]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-left text-white uppercase "
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-left text-white uppercase "
                >
                  Task Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-left text-white uppercase "
                >
                  Candidates
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-right text-white uppercase "
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-right text-white uppercase "
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-xs font-bold text-right text-white uppercase "
                ></th>
              </tr>
            </thead>
            {tasks.map((task) => (
              <TaskCard key={task.Id} task={task} id={projectId} />
            ))}
          </table>
        ) : (
          <div className="flex justify-center align-center">
            <h1 className="text-2xl font-bold text-white">No Tasks Found</h1>
          </div>
        )}
      </section>
    </>
  );
};

export default ProjectInfo;
