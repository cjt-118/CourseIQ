# E1: Account access and dashboard
Students and instructors sign in with their university credentials and see a personalized dashboard.

## US1: Sign in with university SSO
As a student, I want to sign in with my existing university login so that I don't have to create and remember another password.
FR: FR6
Priority: Must
MVP: no

- [ ] The login page offers only a "Sign in with University SSO" button, with no username or password fields (C2).
- [ ] Clicking the button redirects the user to the university's SAML SSO page.
- [ ] After successful authentication, the user is returned to the app and lands on their dashboard.
- [ ] If authentication fails or is cancelled, the user is returned to the login page with the message "Sign-in was not completed. Please try again."
- [ ] The user's account is assigned the role (student or instructor) returned by SSO.
- [ ] Session tokens are stored in the database encrypted with AES-256 (NFR3).

## US2: View my dashboard
As a student, I want to see my saved courses and the reviews I've written when I log in so that I can quickly pick up where I left off.
FR: FR12
Priority: Should
MVP: yes

- [ ] After login, the dashboard shows a "Saved Courses" section and a "My Reviews" section.
- [ ] Each saved course shows its course code, title, and professor, and links to its course page.
- [ ] Each review shows the course code, submission date, and overall rating, and links to the full review.
- [ ] If either section has no items, it shows an empty-state message (e.g., "You haven't saved any courses yet") instead of a blank area.
- [ ] The dashboard fully loads in under 2 seconds on a standard broadband connection (NFR1).

## US3: Save a course
As a student, I want to save a course to my dashboard so that I can come back to courses I'm considering.
FR: FR12
Priority: Should
MVP: yes

- [ ] Each course page has a "Save" button.
- [ ] Clicking "Save" adds the course to the dashboard's "Saved Courses" section and changes the button label to "Saved."
- [ ] Clicking "Saved" removes the course from "Saved Courses" and changes the button label back to "Save."
- [ ] A course appears in "Saved Courses" at most once.
- [ ] Saved courses remain after the user logs out and logs back in.

## US4: Mark courses as taken
As a student, I want to mark courses I've already completed so that I can check whether I meet the prerequisites for courses I'm considering.
FR: FR12
Priority: Could
MVP: no

- [ ] Each course page has a "Taken" button.
- [ ] Clicking "Taken" adds the course to a "Taken Courses" section on the dashboard and changes the button label to "Taken ✔."
- [ ] Clicking "Taken ✔" removes the course from "Taken Courses" and changes the button label back to "Taken."
- [ ] A course appears in "Taken Courses" at most once.
- [ ] Marking a course as taken does not add it to or remove it from "Saved Courses."
- [ ] On a course page, each listed prerequisite that the student has marked as taken is shown as met.
- [ ] Taken courses remain after the user logs out and logs back in.

# E2: Course discovery
Students find courses and understand what they're like before enrolling.

## US5: Search for courses
As a student, I want to search for courses by department, professor, or course code so that I can quickly find classes I'm interested in.
FR: FR3
Priority: Must
MVP: yes

- [ ] The search page has filters for department, professor, and course code.
- [ ] Filters can be combined, and results match all selected filters.
- [ ] Each result shows the course code, title, professor, and average difficulty rating (or "Not enough data" if the course has no reviews).
- [ ] If no courses match, the page shows "No courses found."
- [ ] Search results return in under 500 ms with up to 5,000 users searching at the same time (NFR5).
- [ ] The search page displays without horizontal scrolling at a 375 px viewport width (NFR4).

## US6: View course details
As a student, I want to see a course's professor, description, meeting times, and student reviews in one place so that I can decide whether to take it.
FR: FR1
Priority: Must
MVP: yes

- [ ] The course page shows the professor, course description, and scheduled meeting times.
- [ ] The course page lists written student reviews, newest first.
- [ ] Reviews never show the reviewer's name or any other identifying information (C1).
- [ ] If the course has no reviews, the page shows "No reviews yet" with a link to write one.
- [ ] The course page displays without horizontal scrolling at a 375 px viewport width (NFR4).

## US7: See workload and difficulty averages
As a student, I want to see a course's average weekly workload and difficulty so that I can balance my schedule.
FR: FR1, FR11
Priority: Must
MVP: yes

- [ ] The course page shows average weekly workload in hours, rounded to one decimal place.
- [ ] The course page shows average difficulty on the same scale as the review form (e.g., 1–5).
- [ ] Each average shows how many reviews it is based on (e.g., "Based on 23 reviews").
- [ ] When a review is submitted, edited, or deleted, the averages reflect the change the next time the course page is loaded.
- [ ] If the course has no reviews, each average shows "Not enough data" instead of a number.

## US8: See grade distribution
As a student, I want to see a course's grade distribution and average grade so that I know what to expect.
FR: FR1
Priority: Must
MVP: yes

- [ ] The course page shows a chart of the percentage of students who received each letter grade.
- [ ] The course page shows the average grade.
- [ ] Only aggregated data is shown, and no individual student's grade can be viewed or inferred (C1).
- [ ] If fewer than 5 grades are available, the chart and average are hidden and replaced with "Not enough data to display" (C1).

## US9: Compare courses side by side
As a student, I want to compare up to three courses side by side so that I can choose between similar options.
FR: FR9
Priority: Should
MVP: no

- [ ] The student can add a course to the comparison from its course page or from search results.
- [ ] The comparison view shows each selected course in its own column, with its course code, title, average weekly workload, and average difficulty.
- [ ] Trying to add a fourth course shows the message "You can compare up to 3 courses."
- [ ] The student can remove any course from the comparison.

## US10: See up-to-date official course information
As a student, I want course descriptions, prerequisites, and schedules to match the university's official catalog so that I'm not planning around outdated information.
FR: FR4
Priority: Must
MVP: no

- [ ] Course descriptions, prerequisites, and schedules come from the university's course catalog API, not manual entry.
- [ ] Changes made in the official catalog appear in the app within 24 hours (NFR6).
- [ ] The course page shows the date and time the official information was last updated.
- [ ] If the catalog API is unavailable, the app continues to show the most recently synced data.
