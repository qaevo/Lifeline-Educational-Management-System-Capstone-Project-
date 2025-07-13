from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from app import views
from .views import oauth2_login, oauth2_callback, google_classroom_list, get_classrooms, logout
from django.conf.urls import include

urlpatterns = [
    path("token/", views.TokenView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("register/", views.RegisterView.as_view()),
    path("dashboard/", views.dashboard),
    path("updateuserprofile/<int:user_id>/", views.UpdateUserProfileView.as_view()),
    path("updatestudent/<int:user_id>/", views.UpdateStudentView.as_view()),
    path("prestudentlist/<int:branch>/", views.PreStudentView.as_view()),
    path("studentlist/<int:branch>/", views.StudentView.as_view()),
    path("partiallypaidstudentlist/<int:branch>/", views.PartiallyPaidStudentView.as_view()),
    path("studentenrollmentlist/<int:branch>/", views.StudentEnrollmentsView.as_view()),
    path("facultylist/<int:branch>/", views.FacultyView.as_view()),
    path("modulelist/", views.ModuleView.as_view()),
    path("file/<int:user_id>/<str:type>/", views.FileView.as_view()),
    path("uploadfile/", views.UploadFileView.as_view()),
    path("course/", views.CourseView.as_view()),
    # path("enrollmentslist/<int:teacherid>", views.EnrollmentByTeacherView.as_view()),
    # path("enrollmentslist/<int:teacherid>/<int:moduleid>", views.EnrollmentByTeacherView.as_view()),
    # path("enrollmentslist/s/<int:studentid>", views.EnrollmentByStudentView.as_view()),
    # path("enroll/", views.EnrollmentView.as_view()),
    # path("enrollfinish/<int:student>/", views.UpdateStudentFinishView.as_view()),
    path("getenrollments/", views.GetCurrentEnrollmentsView.as_view()),
    path("createenrollment/", views.CreateEnrollmentView.as_view()),
    path("dropenrollment/", views.DropEnrollmentView.as_view()),
    path("updatefinishenrollment/", views.FinishEnrollmentView.as_view()),
    path("addannouncement/", views.AddAnnouncementView.as_view()),
    path("getannouncements/<int:id>", views.GetAnnouncementsView.as_view()),
    path("getpartialannouncements/<int:id>", views.GetPartialAnnouncementsView.as_view()),
   path('updateannouncement/<int:id>/', views.UpdateAnnouncementView.as_view(), name='update-announcement'),
    path('login/', oauth2_login, name='oauth2_login'),
    path('oauth2callback/', oauth2_callback, name='oauth2_callback'),
    path('classroom/', google_classroom_list, name='google_classroom_list'),
    path('classrooms/', get_classrooms, name='classrooms'),
    
    #NEW Paths
    path("createmodule/", views.CreateModuleView.as_view()),
    path("getprogram/<int:branchID>/", views.GetProgramView.as_view()),
    path("getprogrammodules/", views.GetProgramModulesView.as_view()),
    path("getmodules/", views.GetModulesView.as_view()),
    path("createprogram/", views.CreateProgramView.as_view()),
    path("createprogrammodules/", views.CreateProgramModulesView.as_view()),
    path("getcourses/<int:branch>/", views.GetCourseView.as_view()),
    path("getcoursesinprogram/", views.GetCourseInProgramView.as_view()),
    path("getcourseaudit/", views.GetCourseAuditView.as_view()),
    path("getcoursesfaculty/", views.GetCoursesFacultyView.as_view()),
    path("updateuserstatus/", views.UpdateUserStatusView.as_view()),
    path("updateusercomment/", views.UpdateUserCommentView.as_view()),
    path("getstudentsbycourse/<int:course>/", views.GetStudentsByCourseView.as_view()),
    path("dissolvecourse/<int:id>/", views.DissolveCourseView.as_view()),
    
    path("getgradesystems/", views.GetGradeSystemsView.as_view()),
    path("getgradesofgradesystem/<int:id>/", views.GetGradesOfGradeSystemView.as_view()),
    path("getmoduleswithgradesystem/", views.GetModuleswithGradeSystemView.as_view()), # query for getting modules with gradesystem.
    path("createcourse/", views.CreateCourseView.as_view()),
    path("getteachers/<int:branchID>/", views.GetTeacherListView.as_view()),
 #  path('create_class/', views.CreateClassView.as_view()),
    path('create_classroom_course/', views.create_classroom_course, name='create_classroom_course'),
    
    path("getteachersemail/<int:branchID>/", views.GetTeacherListView.as_view()),
    path('logout/', logout, name='logout'),
    path("getprogramsreport4/<int:branchID>/", views.GetReportsProgramView.as_view()),
    path('getschedules/', views.GetSchedulesView.as_view(), name='get-schedules'),
    path('createschedule/', views.CreateScheduleView.as_view(), name='create-schedule'),
    path('send-classroom-invite/', views.send_classroom_invite, name='send_classroom_invite'),
    
    path('oauth2-login2/', views.oauth2_login2, name='oauth2_login2'),
    path('getschedule/', views.GetScheduleView.as_view(), name='get-schedule'),
    path('assign_teacher_to_class/', views.AssignTeacherToClassView.as_view(), name='assign_teacher_to_class'),
    
    path('getmodulesofprogram/', views.GetModulesOfProgram.as_view(), name='get_modules_of_program'),
    
    path('getbranches/', views.GetBranchView.as_view(), name='get-branch'),
    
    path('enrollmentstats/', views.EnrollmentStatsView.as_view(), name='enrollment-stats'),
    path('programstats/', views.ProgramStatsView.as_view(), name='enrollment-stats'),
    path('modulestats/', views.ModuleStatsView.as_view(), name='module-stats'),
    path('reports/', views.ReportView.as_view(), name='report-list'),
    path('reports/<int:report_id>/', views.ReportView.as_view(), name='report-detail'),
    path('getactivecourses/<int:branchid>', views.ActiveCoursesView.as_view(), name='get-active-courses'),

    path('archiveannouncement/<int:id>/', views.ArchiveAnnouncementView.as_view(), name='archive_announcement'),
    path('getthreerandomprograms/', views.GetThreeRandomProgramsView.as_view(), name='get-three-random-programs'),
    path("log-matching/", views.LogMatchingView.as_view(), name="log-matching"),
    path("getmatching-logs/", views.MatchingLogListView.as_view(), name="matching-logs"),
    path("matching-logs/", views.MatchingLogListView.as_view(), name="matching-logsStudent"),
]