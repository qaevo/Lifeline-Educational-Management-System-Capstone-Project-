from django.shortcuts import render, get_object_or_404
from django.db.models.functions import Cast, TruncDate
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from datetime import datetime, timedelta
from .serializer import *
from .models import *
# new imports
from django.http import JsonResponse
from django.conf import settings
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from django.shortcuts import redirect
import os 
import logging
from django.utils import timezone

from rest_framework.views import APIView
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Q, DateField, F
import json
from django.utils.dateparse import parse_date
from collections import defaultdict



class TokenView(TokenObtainPairView):
    serializer_class = TokenSerializer
    
    
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = RegisterSerializer



class CourseView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer



class GetCourseView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = GetCourseSerializer
    
    def get_queryset(self):
        branch_id = self.kwargs['branch']
        queryset = Course.objects if branch_id == 999 else Course.objects.filter(branch=branch_id).exclude(status="DISSOLVED")
        return queryset



class GetCourseInProgramView(generics.ListAPIView):
    serializer_class = GetCourseSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        state = self.request.query_params.get('state')
        program_id = self.request.query_params.get('program')
        program = Program.objects.filter(id=program_id).first()
        
        module_ids = program.programmodules_set.values_list('module', flat=True)
        queryset = Course.objects.filter(module__id__in=module_ids)
        
        match state:
            case "open": return queryset.filter(start_enroll__lt=datetime.now(), start_course__gt=datetime.now(), branch=program.branch)
            case "ongoing": return queryset.filter(start_course__lt=datetime.now(), end_course__gt=datetime.now(), branch=program.branch)
            case "closed": return queryset.filter(end_course__lt=datetime.now(), branch=program.branch)
            case _: return None

        return Response({"error": "Something went wrong."}, status=status.HTTP_404_NOT_FOUND)



class GetCourseAuditView(generics.ListAPIView):
    serializer_class = GetCourseAuditSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        student_id = self.request.query_params.get('student')
        student = UserProfile.objects.filter(id=student_id).first()
        
        if student is None:
            return None
        
        module_ids = student.program.programmodules_set.values_list('module', flat=True)
        enrolled_courses = StudentCourse.objects.filter(course__module__in=module_ids, student=student).exclude(status="DROPPED")
        enrolled_courses_ids = enrolled_courses.values_list('course__module__id', flat=True)
        unenrolled_modules = Module.objects.filter(id__in=module_ids).exclude(id__in=enrolled_courses_ids)
        queryset = list(enrolled_courses) + list(unenrolled_modules)
        return queryset



class GetCoursesFacultyView(generics.ListAPIView):
    serializer_class = GetCoursesFacultySerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        teacher = self.request.query_params.get('teacherid')
        return Course.objects.filter(teacher=teacher, start_enroll__lt=timezone.now(), end_course__gt=timezone.now()).exclude(status="DISSOLVED")
    


    
# class EnrollmentView(generics.CreateAPIView):
#     queryset = Enrollment.objects.all()
#     serializer_class = EnrollmentSerializer
    
#     def create(self, request, *args, **kwargs):
#         # Retrieve student and teacher IDs from request data
#         student_id = request.data.get('student')
#         teacher_id = request.data.get('teacher')
        
#         # Ensure student_id and teacher_id are present
#         if student_id is None or teacher_id is None:
#             return Response({"error": "Both student and teacher IDs are required"}, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             # Retrieve student and teacher objects
#             student = UserProfile.objects.get(id=student_id)
#             teacher = UserProfile.objects.get(id=teacher_id)
#         except UserProfile.DoesNotExist:
#             return Response({"error": "Student or teacher not found"}, status=status.HTTP_404_NOT_FOUND)

#         # Check roles
#         if student.role != "STUDENT" or teacher.role != "FACULTY":
#             return Response({"error": "Student must have role STUDENT and teacher must have role FACULTY"}, status=status.HTTP_400_BAD_REQUEST)

#         # Continue with enrollment creation
#         return super().create(request, *args, **kwargs)
        
        

class UpdateUserProfileView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = UpdateUserProfileSerializer
    lookup_field = 'user_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully"})

        else:
            return Response({"message": "failed", "details": serializer.errors})



class UpdateStudentView(UpdateUserProfileView):
    queryset = UserProfile.objects.all()
    permission_classes = ([AllowAny])
    serializer_class = UpdateStudentSerializer
    lookup_field = 'user_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated successfully"})

        else:
            return Response({"message": "failed", "details": serializer.errors})



class UpdateUserStatusView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UpdateUserStatusSerializer

    def update(self, request, *args, **kwargs):
        user_id = request.data.get('id')
        new_status = request.data.get('status')
        
        # Validate the presence of parameters
        if not user_id or not new_status:
            return Response({"error": "Both 'id' and 'status' query parameters are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the UserProfile instance based on the user_id
        try:
            user_profile = UserProfile.objects.get(user_id=user_id)
        except UserProfile.DoesNotExist:
            return Response({"error": "UserProfile with the specified user ID does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        match new_status:
            case "CONFIRMED": 
                user_profile.details.pop("comments") if "comments" in user_profile.details else None
                studentid = datetime.now().strftime("%Y-%m%d%H%M%S")
                user_profile.user.studentid = studentid
                user_profile.user.save()
                
        
        # Use the serializer to validate and update the status
        serializer = self.get_serializer(user_profile, data={'status': new_status}, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
    
    
    
class UpdateUserCommentView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UpdateUserStatusSerializer

    def update(self, request, *args, **kwargs):
        user_id = request.data.get('id')
        comment = request.data.get('comment')
        
        # Validate the presence of parameters
        if not user_id or not comment:
            return Response({"error": "Both 'id' and 'comment' query parameters are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the UserProfile instance based on the user_id
        try:
            user_profile = UserProfile.objects.get(user_id=user_id)
        except UserProfile.DoesNotExist:
            return Response({"error": "UserProfile with the specified user ID does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
        # Use the serializer to validate and update the status
        user_profile.details["comments"] = comment
        user_profile.save()

        serializer = self.get_serializer(user_profile)
        return Response(serializer.data)
    
        
        
# class UpdateStudentFinishView(generics.UpdateAPIView):
#     serializer_class = EnrollFinishStudentSerializer
#     model = serializer_class.Meta.model
#     lookup_field = 'student'
    
#     def get_queryset(self):
#         student = self.kwargs['student']
#         queryset = self.model.objects.filter(student=student, finishDatetime=None)
#         return queryset

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
        
#         if serializer.is_valid():
#             instance.finishDatetime = datetime.now()
#             instance.save()
#             return Response({"message": "Student finished"})
#         else:
#             return Response({"message": "failed", "details": serializer.errors})



class PreStudentView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        branch_id = self.kwargs['branch']
        queryset = self.model.objects.filter(branch_id=branch_id, role="PRE-STUDENT")
        return queryset



class StudentView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        branch_id = self.kwargs['branch']
        status = self.request.query_params.get('status')

        return self.model.objects.filter(
            role="STUDENT", 
            status=status, 
            **({} if branch_id == 999 else {'branch_id': branch_id})
        ) if status is not None else self.model.objects.filter(
            role="STUDENT", 
            **({} if branch_id == 999 else {'branch_id': branch_id})
        )



class PartiallyPaidStudentView(generics.ListAPIView):
    serializer_class = PartiallyPaidStudentSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        branch_id = self.kwargs['branch']
        status = ["PARTIALLY_PAID", "ON_HOLD"]

        return self.model.objects.filter(
            role="STUDENT", 
            status__in=status, 
            **({} if branch_id == 0 else {'branch_id': branch_id})
        ) if status is not None else self.model.objects.filter(
            role="STUDENT", 
            **({} if branch_id == 0 else {'branch_id': branch_id})
        )



class StudentEnrollmentsView(generics.ListAPIView):
    serializer_class = StudentEnrollmentSerializer
    
    def get_queryset(self):
        branch = self.kwargs['branch']
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        queryset = UserProfile.objects.filter(role="STUDENT")
        
        if branch != 999:
            queryset = queryset.filter(branch__id=branch)

        if start_date and end_date:
            queryset = queryset.filter(
                Q(userdatetime__description="ACCOUNT CREATED", userdatetime__datetime__range=[start_date, end_date])
            ).distinct()
        
        return queryset



class FacultyView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        branch_id = self.kwargs['branch']
        queryset = self.model.objects.filter(branch_id=branch_id, role="FACULTY")
        return queryset



class ModuleView(generics.ListAPIView):
    serializer_class = CourseSerializer
    model = serializer_class.Meta.model
    queryset = Course.objects.all()



class FileView(generics.ListAPIView):
    serializer_class = FileSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        id = self.request.query_params.get('id')
        user_id = self.kwargs['user_id']
        type = self.kwargs['type']
        return self.model.objects.filter(id=id, user_id=user_id, type=type) if id is not None else self.model.objects.filter(user_id=user_id, type=type)
    
    
    
class UploadFileView(generics.CreateAPIView):
    serializer_class = FileSerializer
    queryset = File.objects.all()
    
    def perform_create(self, serializer):
        type = self.request.data.get('type')
        user = self.request.data.get('user')
        
        existing_instance = File.objects.filter(type=type, user=user).first()
        
        if existing_instance and type == "birthCert":
            serializer = self.get_serializer(existing_instance, data=self.request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            self.response_status = status.HTTP_200_OK
        else:
            serializer.save()
            self.response_status = status.HTTP_201_CREATED

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(response.data, status=getattr(self, 'response_status', response.status_code))



# class EnrollmentByTeacherView(generics.ListAPIView):
#     serializer_class = EnrollmentSerializer
#     model = serializer_class.Meta.model
    
#     def get_queryset(self):
#         teacher = self.kwargs['teacherid']
#         course = self.kwargs.get('moduleid') if self.kwargs.get('moduleid') is not None else None
#         queryset = Enrollment.objects.all()
        
#         if teacher != 0 and course != 0:
#             queryset = Enrollment.objects.filter(teacher=teacher, course=course)
        
#         if teacher != 0 and course is None:
#             queryset = Enrollment.objects.filter(teacher=teacher)
        
#         return queryset
            
            
            
# class EnrollmentByStudentView(generics.ListAPIView):
#     serializer_class = EnrollmentSerializer
#     model = serializer_class.Meta.model
    
#     def get_queryset(self):
#         student = self.kwargs['studentid']
#         queryset = Enrollment.objects.filter(student=student).order_by('enrollDatetime')
#         return queryset

class CreateModuleView(generics.CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    
    
class GetProgramView(generics.ListAPIView):
    serializer_class = ProgramSerializer
    permission_classes = ([AllowAny])
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        branch = self.kwargs.get('branchID')
        return Program.objects.filter(branch=self.kwargs.get('branchID')) if branch != 999 else Program.objects.all()



class GetThreeRandomProgramsView(generics.ListAPIView):
    serializer_class = ProgramSerializer
    model = serializer_class.Meta.model
    permission_classes = ([AllowAny])
    
    def get_queryset(self):
        return Program.objects.order_by('?')[:3]



class GetReportsProgramView(generics.ListAPIView):
    serializer_class = ReportProgramSerializer

    def get_queryset(self):
        branch_id = self.kwargs.get('branchID', None)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)
        
        queryset = Program.objects.all()
        
        if branch_id != 999:
            queryset = queryset.filter(branch_id=branch_id)
        
        # Annotate each program with the count of enrolled students
        return queryset.annotate(
            enrolled_students=Count(
                "userprofile",
                filter=Q(
                    userprofile__role="STUDENT",
                    userprofile__userdatetime__datetime__date__gte=start_date if start_date else None,
                    userprofile__userdatetime__datetime__date__lte=end_date if end_date else None,
                ),
            )
        )
    
class CreateProgramView(generics.CreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    
class GetProgramModulesView(generics.ListAPIView):
    serializer_class = ProgramModulesSerializer
    model = serializer_class.Meta.model
    queryset = ProgramModules.objects.all()
    
class CreateProgramModulesView(generics.CreateAPIView):
    queryset = ProgramModules.objects.all()
    serializer_class = ProgramModulesSerializer

    def create(self, request, *args, **kwargs):
        # Expecting a list of program module entries
        program_modules_data = request.data
        serializer = self.get_serializer(data=program_modules_data, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class GetModulesView(generics.ListAPIView):
    serializer_class = ModuleSerializer
    model = serializer_class.Meta.model
    queryset = Module.objects.all()
    
class GetTeacherListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        branch_id = self.kwargs.get('branchID', None)
        if branch_id is not None:
            return UserProfile.objects.filter(branch_id=branch_id, role="FACULTY")
        return UserProfile.objects.none() 



class CreateCourseView(generics.CreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        start_enroll = serializer.validated_data.get('start_enroll')
        start_course = serializer.validated_data.get('start_course')
        end_course = serializer.validated_data.get('end_course')
        
        if start_enroll < timezone.now() or start_course < timezone.now() or end_course < timezone.now():
            return Response(
                {"message": "Cannot set date to past date."},
                status=400
            )

        if start_enroll > start_course:
            return Response(
                {"message": "Start course date must come after start enroll date."},
                status=400
            )

        if start_course > end_course:
            return Response(
                {"message": "End course date must come after start course date."},
                status=400
            )
        
        self.perform_create(serializer)
        return Response(serializer.data, status=201)
    
    

class GetGradeSystemsView(generics.ListAPIView):
    serializer_class = GradeSystemSerializer
    model = serializer_class.Meta.model
    queryset = GradeSystem.objects.all()



class GetGradesOfGradeSystemView(generics.ListAPIView):
    serializer_class = GradeSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        gs = Module.objects.filter(id=self.kwargs.get('id')).first().module_gradetype
        return Grade.objects.filter(type=gs)
    
    
    
class GetModuleswithGradeSystemView(generics.ListAPIView):
    serializer_class = ModuleViewSerializer
    model = serializer_class.Meta.model
    def get_queryset(self):
        # Prefetch related grade system to optimize the query
        return Module.objects.select_related('module_gradetype')

class GetScheduleView(generics.ListAPIView):
    serializer_class = ScheduleSerializer
    model = serializer_class.Meta.model
    queryset = Schedule.objects.all()
    

class GetCurrentEnrollmentsView(generics.ListAPIView):
    serializer_class = GetStudentCourseSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        student = self.request.query_params.get('student')
        return StudentCourse.objects.filter(student=student, finishDatetime__isnull=True).exclude(status="DROPPED")
            


class CreateEnrollmentView(generics.CreateAPIView):
    queryset = StudentCourse.objects.all()
    serializer_class = CreateStudentCourseSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        student = serializer.validated_data.get("student")
        course = serializer.validated_data.get("course")
        
        # Check if student is enrolling in the same course
        if StudentCourse.objects.filter(student=student, course=course).exclude(status="DROPPED").exists():
            return Response(
                {"message": "You are already enrolled in this course."},
                status=400
            )
        
        # Check if student is enrolling in course of different branch
        if student.branch != course.branch:
            return Response(
                {"message": "Student and course branches do not match.", "details": serializer.errors},
                status=400
            )

        # Check if user enrolling is a student
        if student.role != "STUDENT":
            return Response(
                {"message": "Only students can be enrolled.", "details": serializer.errors},
                status=400
            )

        # Check if student has already enrolled in same module but different course
        if StudentCourse.objects.filter(student=student, course__module=course.module).exclude(course=course).exclude(status="DROPPED").exists():
            return Response(
                {"message": "You are already enrolled in another course for this module."},
                status=401
            )

        def check_schedule_conflict(new_schedule):
            enrolled_courses = StudentCourse.objects.filter(student=student, finishDatetime__isnull=True, grade__isnull=True).exclude(status="DROPPED").values_list('course', flat=True)
            enrolled_schedules = Schedule.objects.filter(course__in=enrolled_courses)
            
            for schedule in enrolled_schedules:
                # Check if there is any overlap in days
                if any(day in new_schedule.days for day in schedule.days):
                    # Check if the time ranges overlap
                    if not (new_schedule.end_time <= schedule.start_time or new_schedule.start_time >= schedule.end_time):
                        return True
            return False

        if check_schedule_conflict(course.schedule):
            return Response(
                {"message": "You are currently enrolled in a course with conflicting schedules."},
                status=401
            )
        
        def check_capacity(course):
            enrolled_students = StudentCourse.objects.filter(course=course).exclude(status="DROPPED").count()
            return enrolled_students >= course.capacity
        
        if check_capacity(course):
            return Response(
                {"message": "Course is already full."},
                status=401
            )
        
        self.perform_create(serializer)
        return Response(serializer.data, status=201)
    


class DropEnrollmentView(generics.UpdateAPIView):
    queryset = StudentCourse.objects.all()
    serializer_class = DropEnrollmentSerializer
    
    def get_object(self):
        # Extract student and course from the request data
        student_id = self.request.data.get("student")
        course_id = self.request.data.get("course")
        
        # Ensure both student and course IDs are provided
        if not student_id or not course_id:
            raise serializers.ValidationError({"detail": "Both student and course IDs are required."})
        
        return StudentCourse.objects.filter(student_id=student_id, course_id=course_id).exclude(status="DROPPED").first()
    
    def update(self, request, *args, **kwargs):
        request.data["status"] = "DROPPED"
        return super().update(request, *args, **kwargs)


class GetStudentsByCourseView(generics.ListAPIView):
    serializer_class = GetStudentCourseSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        course = self.kwargs.get('course')
        return StudentCourse.objects.filter(course=course).exclude(status="DROPPED").order_by('enrollDatetime')



class FinishEnrollmentView(generics.UpdateAPIView):
    queryset = StudentCourse.objects.all()
    serializer_class = FinishStudentCourseSerializer

    def get_object(self):
        # Extract student and course from the request data
        student_id = self.request.data.get("student")
        course_id = self.request.data.get("course")
        
        # Ensure both student and course IDs are provided
        if not student_id or not course_id:
            raise serializers.ValidationError({"detail": "Both student and course IDs are required."})
        
        # Use both fields to retrieve the specific StudentCourse instance
        return StudentCourse.objects.filter(student_id=student_id, course_id=course_id).exclude(status="DROPPED").first()

    def update(self, request, *args, **kwargs):
        # Ensure grade is provided
        grade = request.data.get("grade")
        if grade is None:
            raise serializers.ValidationError({"detail": "Grade is required."})

        # Set the finishDatetime to the current time
        request.data["finishDatetime"] = timezone.now()

        # Proceed with the update
        return super().update(request, *args, **kwargs)




class AddAnnouncementView(generics.CreateAPIView):
    queryset = Announcements.objects.all()
    serializer_class = AnnouncementSerializer



class GetAnnouncementsView(generics.ListAPIView):
    serializer_class = AnnouncementSerializer
    model = serializer_class.Meta.model
    
    def get_queryset(self):
        branch = Branch.objects.filter(id=self.kwargs.get('branch')).first()
        return Announcements.objects.all().filter(Q(branch=branch) | Q(branch_id=999)).order_by('-datetime').exclude(status="ARCHIVED")



class GetPartialAnnouncementsView(generics.ListAPIView):
    serializer_class = AnnouncementSerializer
    model = serializer_class.Meta.model

    def get_queryset(self):
        branch = Branch.objects.filter(id=self.kwargs.get('branch')).first()
        one_month_ago = timezone.now() - timedelta(days=30)
        return Announcements.objects.filter(datetime__gte=one_month_ago).filter(Q(branch=branch) | Q(branch_id=999)).order_by('-datetime').exclude(status="ARCHIVED")
    
    
    

    
    
    
class GetTeacherListEmailView(generics.ListAPIView):
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        branch_id = self.kwargs.get('branchID', None)
        if branch_id is not None:
            # Use select_related to fetch related User objects
            return UserProfile.objects.filter(branch_id=branch_id, role="FACULTY").select_related('user')
        return UserProfile.objects.none()



@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == "GET":
        context = f"Hello {str(request.user.userprofile)}"
        return Response({'response': context}, status=status.HTTP_200_OK)
    elif request.method == "POST":
        text = request.POST.get("text")
        context = f"POST"
        return Response({'response': context}, status=status.HTTP_200_OK)
    return Response({}, status=status.HTTP_400_BAD_REQUEST)


# Google Integration

SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters'
]


def oauth2_login(request):
    redirect_path = request.GET.get('next', '/')
    request.session['redirect_path'] = redirect_path

    # Extract course data from query parameters and store it in session
    request.session['course_data'] = {
        'name': request.GET.get('name'),
        'section': request.GET.get('section'),
        'descriptionHeading': request.GET.get('descriptionHeading'),
        'description': request.GET.get('description'),
        'ownerId': ('me'),  # This sets the owner as the current authenticated user
        "courseState": "Provisioned",
    }
    
    request.session['courseID'] = {'courseID': request.GET.get('courseID')}

    flow = Flow.from_client_secrets_file(
        os.path.join(settings.BASE_DIR, 'config/client_secret.json'),
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_OAUTH2_REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    request.session['state'] = state
    return redirect(authorization_url)

logging.basicConfig(level=logging.INFO)

def oauth2_callback(request):
    logging.info(f"it enters oauth2callback function")
    try:
        state = request.session.get('state')
        if not state:
            raise ValueError("State not found in session")

        redirect_path = 'https://classroom.google.com/h'
        # ===================================
        logging.info(f"Redirect path: {redirect_path}")
        
        flow = Flow.from_client_secrets_file(
            os.path.join(settings.BASE_DIR, 'config/client_secret.json'),
            scopes=SCOPES,
            state=state,
            redirect_uri=settings.GOOGLE_OAUTH2_REDIRECT_URI
        )
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        
        credentials = flow.credentials
        logging.info(f"Credentials: {credentials_to_dict(credentials)}")
        
        request.session['credentials'] = credentials_to_dict(credentials)
        
        if request.session.get('redirect_path') == 'send-classroom-invite/':
            logging.info(f"SENDING YOU TO CLASSROOM INVITE FROM OAUTHCALLBACK")
            
            invitation_data = request.session.get('invitation_data', {})
            courseId = invitation_data.get('courseId')
            teacherEmail = invitation_data.get('teacherEmail')
            
            class MockRequest2:
              def __init__(self, session, method='GET', get_data=None, post_data=None, path=''):
                self.session = session
                self.method = method  # Set the HTTP method
                self.GET = get_data or {}
                self.POST = post_data or {}
                self.body = json.dumps(post_data).encode('utf-8')  # Encode the POST data as JSON bytes
                self.path = path

            
            post_data = {
                'courseId': courseId,  # Example course ID
                'teacherEmail': teacherEmail  # Example teacher email
            }
            
            mock_request = MockRequest2(request.session, method='POST', post_data=post_data, path='/send-classroom-invite/')

        # Call the create_classroom_course view
            course_response = send_classroom_invite(mock_request)
            if isinstance(course_response, JsonResponse):
                # You can log or process the course_response if needed
                logging.info(f"Invitation sent : {course_response.content}")
            return redirect('https://localhost:3000/createclass')
       
        class MockRequest:
            def __init__(self, session, get_data=None):
                self.session = session
                self.GET = get_data or {}

        mock_request = MockRequest(request.session)

        # Call the create_classroom_course view
        course_response = create_classroom_course(mock_request)

        # Check if the response is a JsonResponse
        if isinstance(course_response, JsonResponse):
            # You can log or process the course_response if needed
            logging.info(f"Course created: {course_response.content}")
        
        return redirect(f'{redirect_path}')
        # return redirect(redirect_path)
    except Exception as e:
        logging.error(f"Error in oauth2_callback: {e}")
        logging.error(f"Request URI: {request.build_absolute_uri()}")
        logging.error(f"Request Session: {dict(request.session.items())}")
        return redirect('https://localhost:3000/error')


@csrf_exempt
def logout(request):
    # Revoke the token if it exists
    credentials = request.session.get('credentials')
    if credentials and 'token' in credentials:
        revoke_url = f"https://oauth2.googleapis.com/revoke?token={credentials['token']}"
        request.post(revoke_url, headers={'content-type': 'application/x-www-form-urlencoded'})

    # Clear the session in Django
    request.session.flush()
    return JsonResponse({'status': 'success'}, status=200)    
    
    
@csrf_exempt
def create_classroom_course(request):
    # Ensure the user is authenticated
    if 'credentials' not in request.session:
        return redirect('oauth2_login')

    # Load user credentials from session
    credentials = Credentials(**request.session['credentials'])
    service = build('classroom', 'v1', credentials=credentials)
    
    
    try:
        user_info = service.userProfiles().get(userId='me').execute()
        user_id = user_info.get('id')  # The authenticated user's ID
        logging.info(f"Course Data for API Call: {user_id}")
    except Exception as e:
        logging.error(f"Error fetching user details: {e}")  
        
    
    course_data = {
        'ownerId': 'me',  # This sets the owner as the current authenticated user
    }
    
    logging.info(f"TEST FOR COURSE DATA: {course_data}")

    # Use course data from session
    course_data = request.session.get('course_data', {
        'name': 'Default Course Name',
        'section': 'Default Section',
        'descriptionHeading': 'Default Heading',
        'description': 'Default Description',
        "courseState": "PROVISIONED",
    })
    

    
    
    logging.info(f"TEST FOR COURSE DATA 222: {course_data}")
    
  #  logging.info(f"TEST FOR COURSE DATA WOITH GET FROM SESSIONS: {course_data}")
    

    try:
        # Make the API call to create the course
        course = service.courses().create(body=course_data).execute()
        logging.info(f"COURSE  ISSSS: {course}")
        logging.info(f"COURSE ID IS  ISSSS: {course['id']}")
        courseInviteID = course['id']
        courseCode =course['enrollmentCode']
        logging.info(f"course code  IS  ISSSS: {courseCode}")
        logging.info(f"COURSE alternate link IS  ISSSS: {request.session.get('courseID')}")
        dbcourseID = request.session.get('courseID')
        logging.info(f"DB course code  IS  ISSSS: {dbcourseID}")
        updatingID = Course.objects.filter(id = request.session.get('courseID')['courseID']).first()
        logging.info(f"UPDATING ID ISSSSS: {updatingID}")
        
        invitation_data = {
        'userId': 'qevo.sw@gmail.com',  # The email of the user to invite
        'courseId': courseInviteID,  # The ID of the course
        'role': 'STUDENT'  # or 'TEACHER' depending on the role
        }    
        logging.info(f"INVITATION DATA IS : {invitation_data}")
        try:
            invitation = service.invitations().create(body=invitation_data).execute()
            logging.info(f"Invitation sent: {invitation}")
        except Exception as e:
            logging.error(f"Error sending invitation: {e}")
 
        logging.info(f"Invitation sent: {invitation}")
    
        logging.info(f"UPDATING ID 2 ISSSSS: {updatingID}")
        if updatingID is not None:
        #    logging.info(f"REQUEST ISSSS: {request.session.get('course_data')}")
            logging.info(f"COURSE  PUMASOK KA PLS: {course}")
            # Get the new courseLink from the request (assuming it's sent in the body)
            new_course_link = course['alternateLink']  # or request.data if using Django REST Framework
            new_courseID = course['id']
            # Update the courseLink field
            updatingID.courseLink = new_course_link
            updatingID.googleCourseID = new_courseID
            updatingID.googleCourseCode =course['enrollmentCode']
            # Save the changes to the database
            updatingID.save()
        
        return JsonResponse(course, status=201)
    except Exception as e:
        logging.error(f"Error creating course: {e}")
        return JsonResponse({'error': str(e)}, status=500)



def google_classroom_list(request):
    if 'credentials' not in request.session:
        return redirect('oauth2_login')

    credentials = Credentials(**request.session['credentials'])
    service = build('classroom', 'v1', credentials=credentials)

    courses = service.courses().list().execute()
    return JsonResponse(courses)

def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
    
def get_classrooms(request):
    credentials = Credentials.from_authorized_user(request.session.get('credentials'))
    service = build('classroom', 'v1', credentials=credentials)
    courses = service.courses().list().execute()
    return JsonResponse(courses)


class GetSchedulesView(generics.ListAPIView):
    def get(self, request):
        schedules = Schedule.objects.all()
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CreateScheduleView(generics.CreateAPIView):
    serializer_class = ScheduleSerializer
    def post(self, request):
        serializer = ScheduleSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def oauth2_login2(request):
    # Store the redirect path for invitations
    request.session['redirect_path'] = 'send-classroom-invite/'

    # Save course and user info for the invitation in session
    request.session['invitation_data'] = {
        'courseId': request.GET.get('courseId'),
        'teacherEmail': request.GET.get('teacherEmail'),
    }

    # Set up the OAuth flow
    flow = Flow.from_client_secrets_file(
        os.path.join(settings.BASE_DIR, 'config/client_secret.json'),
        scopes=SCOPES,
        redirect_uri=settings.GOOGLE_OAUTH2_REDIRECT_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    request.session['state'] = state
    logging.info(f"hi dumaan siya dito hehe")
    return redirect(authorization_url)

@csrf_exempt
def send_classroom_invite(request):
    logging.info(f"helo it enters send_classroom_invite function heehe")
  #  if request.method != 'POST':
   #     return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
    logging.info(f"Request Method: {request.method}")
    logging.info(f"Request Path: {request.path}")

    logging.info(f"lumalagpas sa request.method post shiet")
    if request.method in ['POST', 'PUT', 'PATCH']:
        try:
            body = json.loads(request.body)
            logging.info(f"Request Body AHFAHSDHASDHSAH: {body}")
        except json.JSONDecodeError:
            logging.warning("Request body is not valid JSON")
    
    
    
    course_id = None
    teacher_Email = None
    
    body = request.body.decode('utf-8')  # Decode bytes to string
    logging.info(f"Request Body: {body}")
    logging.info(f"Query Parameters: {request.GET}")

    body_dict = json.loads(body)
    # Extract courseId and teacherEmail
    course_id = body_dict.get('courseId')
    teacher_Email = body_dict.get('teacherEmail')
    
    logging.info(f"Course ID from request is: {course_id}")
    logging.info(f"Course Email from request is: {teacher_Email}")
    
    try:        
        # Ensure the user is authenticated
        if 'credentials' not in request.session:
            logging.info("Missing credentials in session")
            logging.error("Credentials not found in session. Current session data: %s", request.session)
            return JsonResponse({'status': 'error', 'message': 'User not authenticated'}, status=401)

        logging.info(f"passed the credentials check hoho")
        # Load user credentials from session
        credentials = Credentials(**request.session['credentials'])
        service = build('classroom', 'v1', credentials=credentials)
        
        # Create the course invite
        invite = {
            'userId': teacher_Email,
            'courseId': course_id,
            'role': 'TEACHER'
        }
        logging.info(f"Invitation data: {invite}")

        # Send the invite
        invitation = service.invitations().create(body=invite).execute()
        logging.info(f"Invitation sent: {invitation}")
        return JsonResponse({'status': 'success', 'message': 'Invite sent successfully'}, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON payload'}, status=400)
    except Exception as e:
        logging.error(f"Error during invite creation: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    

class AssignTeacherToClassView(APIView):
    def post(self, request):
        class_id = request.data.get('classId')
        teacher_id = request.data.get('teacherId')
        
        

        try:
            course = Course.objects.get(id=class_id)
            teacher = UserProfile.objects.get(id=teacher_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'error': 'Teacher not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignTeacherSerializer(course, data={'teacher': teacher.id}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Teacher assigned successfully!'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class GetModulesOfProgram(APIView):
    def get(self, request):
        student_id = request.query_params.get('student')
        program_id = request.query_params.get('program_id')

        if not program_id:
            return Response({"error": "Program ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get all modules associated with the program
            program_modules = ProgramModules.objects.filter(program_id=program_id)
            modules = [program_module.module for program_module in program_modules]
            serializer = ModuleSerializer(modules, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class GetBranchView(generics.ListAPIView):
    serializer_class = BranchSerializer
    permission_classes = ([AllowAny])
    model = serializer_class.Meta.model
    queryset = Branch.objects.exclude(id=999)



class EnrollmentStatsView(generics.ListAPIView):

    def get_queryset(self, start_date, end_date):
        # Convert strings to date objects
        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        queryset = (
            StudentCourse.objects
            .annotate(date=Cast(TruncDate("enrollDatetime"), DateField()))
            .values("date", module=F("course__module__name"), branch=F("course__branch__name"))
            .annotate(enrollment_count=Count("id"))
            .order_by("date")
        )

        # Apply date filtering
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset
    
    def daily_finish(self, start_date, end_date):
        queryset = (
            StudentCourse.objects
            .annotate(date=Cast(TruncDate("finishDatetime"), DateField()))
            .filter(finishDatetime__isnull=False)
            .values("date", module=F("course__module__name"), branch=F("course__branch__name"))
            .annotate(enrollment_count=Count("id"))
            .order_by("date")
        )
        
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset
    
    def list(self, request, *args, **kwargs):
        # Get date range from request
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        # Convert strings to date objects
        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        response_data = {
            "daily_enrollment": self.get_queryset(start_date, end_date),
            "daily_finish": self.daily_finish(start_date, end_date)
        }

        return Response(response_data)

class ReportView(generics.ListAPIView):
    def get(self, request, report_id=None):
        """Retrieve a single report by ID or all reports."""
        if report_id:
            try:
                report = Report.objects.get(reportID=report_id)
                serializer = ReportSerializer(report)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Report.DoesNotExist:
                return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)
        else:
            reports = Report.objects.all()
            serializer = ReportSerializer(reports, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new report."""
        serializer = ReportSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProgramStatsView (generics.ListAPIView):
    
    def get_queryset(self, start_date, end_date):
        queryset = (
            UserDatetime.objects
            .filter(user__role=UserProfile.STUDENT)
            .annotate(date=Cast(TruncDate("datetime"), DateField()))
            .values("date", module=F("user__program__name"), branch=F("user__branch__name"))
            .annotate(enrollment_count=Count("id"))
            .order_by("date")
        )

        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset
    
    def daily_enrollment_per_branch(self, start_date, end_date):
        queryset = self.get_queryset(start_date, end_date)
        
        # Group results by branch
        grouped_data = defaultdict(list)
        for entry in queryset:
            branch_name = entry.pop("branch")  # Extract branch name
            grouped_data[branch_name].append(entry)  # Append remaining data to that branch

        return grouped_data
        
    
    def total_enrollments(self, start_date, end_date):
        queryset = (
            UserProfile.objects
            .filter(role=UserProfile.STUDENT)
            .values("program__name", "branch__name")
            .annotate(enrollment_count=Count("id"))
        )

        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        elif start_date:
            queryset = queryset.filter(date__gte=start_date)
        elif end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset
    
    def list(self, request, *args, **kwargs):
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        response_data = {
            "daily_enrollment": self.get_queryset(start_date, end_date),
            "daily_enrollment_per_branch": self.daily_enrollment_per_branch(start_date, end_date),
            "total_enrollments": self.total_enrollments(start_date, end_date),
        }

        return Response(response_data)



class ModuleStatsView (generics.ListAPIView):
    def get_queryset(self):
        queryset = (
            StudentCourse.objects
            .filter(finishDatetime__isnull=False)
            .values("grade", name=F("course__module__name"), gradesystem=F("course__module__module_gradetype__description"), branch=F("course__branch__name"))
            .annotate(student_count=Count("student"))
            .order_by("name")
        )

        return queryset
    
    def get_grades(self):
        grades = Grade.objects.select_related("type").values("type__description", "value")
        grade_dict = defaultdict(list)

        for grade in grades:
            grade_dict[grade["type__description"]].append(grade["value"])

        return grade_dict
    
    def list(self, request, *args, **kwargs):
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date:
            start_date = parse_date(start_date)
        if end_date:
            end_date = parse_date(end_date)

        response_data = {
            "module_stats": self.get_queryset(),
            "grades": self.get_grades()
        }

        return Response(response_data)



class DissolveCourseView(generics.UpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = DissolveCourseSerializer
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        request.data["status"] = "DISSOLVED"
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            StudentCourse.objects.filter(course=instance).update(status="DROPPED")
            return Response({"message": "Course dissolved successfully"})

        return Response({"message": "failed", "details": serializer.errors})

class UpdateAnnouncementView(generics.UpdateAPIView):
    queryset = Announcements.objects.all()
    serializer_class = AnnouncementSerializer
    lookup_field = 'id'

class ArchiveAnnouncementView(generics.UpdateAPIView):
    queryset = Announcements.objects.all()
    serializer_class = ArchiveAnnouncementSerializer
    lookup_field = 'id'  # Use 'id' as the lookup field

    def update(self, request, *args, **kwargs):
        # Set the status to "ARCHIVED"
        request.data["status"] = "ARCHIVED"

        # Get the announcement instance
        instance = self.get_object()

        # Validate and save the updated instance
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response({"message": "Announcement archived successfully"})

        # Return error response if validation fails
        return Response({"message": "Failed to archive announcement", "details": serializer.errors})

class ActiveCoursesView(generics.ListAPIView):
    serializer_class = CourseWithStudentsSerializer

    def get_queryset(self):
        branchid = self.kwargs.get("branchid")        
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        # Convert string dates to date objects
        start_date = parse_date(start_date) if start_date else None
        end_date = parse_date(end_date) if end_date else None
        
        queryset = Course.objects.exclude(status="DISSOLVED")
        
        if branchid != 999:
            queryset = queryset.filter(branch_id=branchid)
            
        if start_date and end_date:
            queryset = queryset.filter(Q(start_enroll__range=[start_date, end_date]) | Q(start_course__range=[start_date, end_date]) | Q(end_course__range=[start_date, end_date]))
        elif start_date:
            queryset = queryset.filter(start_enroll__lte=start_date)
        elif end_date:
            queryset = queryset.filter(end_course__gte=end_date)
        else:
            queryset = queryset.filter(
                start_enroll__lte=timezone.now(), end_course__gte=timezone.now()
            )
        
        return queryset.order_by("start_enroll", "start_course", "end_course")
    
class LogMatchingView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Get the current user (the one generating the matching log)
            generated_by = request.user

            # Get the selected student IDs from the request
            student_ids = request.data.get("student_ids", [])

            # Generate the next matching_id (incremental)
            last_matching_log = MatchingLog.objects.order_by('-matching_id').first()
            matching_id = 1 if last_matching_log is None else last_matching_log.matching_id + 1

            # Log each selected student with the same matching_id
            for student_id in student_ids:
                student = UserProfile.objects.get(id=student_id)
                MatchingLog.objects.create(
                    matching_id=matching_id,  # Use the same matching_id for all students
                    generated_by=generated_by,
                    student=student,
                )

            return Response({"message": "Matching log saved successfully."}, status=status.HTTP_201_CREATED)

        except UserProfile.DoesNotExist:
            return Response({"error": "Invalid student ID."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class MatchingLogListView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Fetch all matching logs
            matching_logs = MatchingLog.objects.all()
            serializer = MatchingLogSerializer(matching_logs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class MatchingLogStudentView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            student_id = request.query_params.get("student_id")
            matching_logs = MatchingLog.objects.filter(student=student_id)
            serializer = MatchingLogSerializer(matching_logs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)