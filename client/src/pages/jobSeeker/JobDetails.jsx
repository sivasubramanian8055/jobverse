/* Jayrajsinh Mahavirsinh Jadeja */

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Button,
  Center,
  Spinner,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJobById, fetchApplicationsByEmail } from "./helper/jobApis";
import useFetch from "../../hooks/fetch.hook";

const JobDetails = () => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { jobId } = useParams();

  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" });
  const textSize = useBreakpointValue({ base: "sm", md: "md" });
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await fetchJobById(jobId);
        setJob(jobData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load job details.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        navigate("/job-seeker/jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, navigate, toast]);

  // Fetch user data
  const [{ apiData }] = useFetch("");

  useEffect(() => {
    if (apiData) {
      setUserData(apiData);
      // Check if the user has already applied for the job
      if (apiData.email) {
        fetchApplicationsByEmail(apiData.email)
          .then((applications) => {
            const applied = applications.some(
              (application) => application.jobId._id === jobId
            );
            setHasApplied(applied);
          })
          .catch((error) => {
            console.error("Error fetching applications:", error);
          });
      }
    }
  }, [apiData, jobId]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!job) {
    return (
      <Center h="100vh">
        <Text fontSize={textSize} color="gray.500">
          Job not found
        </Text>
      </Center>
    );
  }

  return (
    <Box p={6} maxW="container.md" mx="auto">
      <Heading as="h1" size={headingSize} mb={4}>
        {job.positionName}
      </Heading>
      <Stack spacing={4}>
        <Text fontSize={textSize} fontWeight="bold">
          Salary: ${job.salary}
        </Text>
        <Text fontSize={textSize} fontWeight="bold">
          Available Positions: {job.positionsAvailable}
        </Text>
        <Text fontSize={textSize} fontWeight="bold">
          Location: {job.location}
        </Text>
        <Text fontSize={textSize} fontWeight="bold">
          Company: {job.companyName}
        </Text>
        <Text fontSize={textSize}>Job Description:</Text>
        <Text fontSize={textSize} whiteSpace="pre-line">
          {job.jobDescription}
        </Text>
        {userData ? (
          userData.roles && userData.roles.Recruiter ? (
            <Text fontSize={textSize} color="gray.500">
              Recruiters cannot apply for jobs.
            </Text>
          ) : hasApplied ? (
            <Text fontSize={textSize} color="green.500">
              You have already applied for this job.
            </Text>
          ) : (
            <Button
              colorScheme="teal"
              onClick={() => navigate(`/job-seeker/job/${job._id}/apply`)}
              size={buttonSize}
            >
              Apply Now
            </Button>
          )
        ) : (
          <Text fontSize={textSize} color="gray.500">
            Log in to apply for this job
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default JobDetails;
