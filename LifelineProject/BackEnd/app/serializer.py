from rest_framework_simplejwt.tokens import Token
from .models import *
from datetime import datetime
# from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.db.models import Max, F, Avg

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email']



class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    studentid = serializers.CharField(source='user.studentid', read_only=True)
    branch_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['role', 'branch', 'studentid', 'branch_name', 'lastName', 'firstName', 'middleName', 'extensions', 'details', 'user_id', 'email', 'program', 'status']
    
    def get_branch_name(self, obj):
        return obj.branch.name if obj.branch else None


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'
        
        

class BasicUserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    studentid = serializers.CharField(source='user.studentid', read_only=True)
    branch = BranchSerializer()
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['role', 'branch', 'studentid', 'name', 'user_id', 'email']
        
    def get_name(self, obj):
        name_parts = filter(None, [obj.firstName, obj.middleName, obj.lastName, obj.extensions])
        return " ".join(name_parts)



class PartiallyPaidStudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    phoneNumber = serializers.CharField(source='details.phoneNumber', read_only=True)
    proof_of_payments = serializers.SerializerMethodField()
    class Meta:
        model = UserProfile
        fields = ['user_id', 'name', 'email', 'phoneNumber', 'proof_of_payments', 'status']
    
    def get_name(self, obj):
        name_parts = filter(None, [obj.firstName, obj.middleName, obj.lastName, obj.extensions])
        return " ".join(name_parts)
        
    def get_proof_of_payments(self, obj):
        files = File.objects.filter(user=obj.id, type="proof_of_payment")
        return FileSerializer(files, many=True).data



class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'



class TokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['email'] = user.email
        token['studentid'] = user.studentid
        token['status'] = user.userprofile.status
        token['program'] = user.userprofile.program.id if user.userprofile.role == "STUDENT" else None
        token['programName'] = user.userprofile.program.name if user.userprofile.role == "STUDENT" else None
        token['role'] = user.userprofile.role
        token['branch'] = user.userprofile.branch.id
        token['lastName'] = user.userprofile.lastName
        token['firstName'] = user.userprofile.firstName
        token['middleName'] = user.userprofile.middleName
        token['extensions'] = user.userprofile.extensions
        
        details = user.userprofile.details
        file = File.objects.filter(user_id=user.id, type="birthCert").first()
        if file and user.userprofile.role == "PRE-STUDENT":
            details['birthCertName'] = file.file_name
        
        token['details'] = details
        
        return token



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only = True,
        required = True,
        # validators=[validate_password]
    )
    # password2 = serializers.CharField(
    #     write_only = True,
    #     required = True
    # )
    
    userprofile = UserProfileSerializer()
    
    class Meta:
        model = User
        fields = ['email', 'password', 'userprofile']
    
    def create(self, validated_data):
        profile_data = validated_data.pop('userprofile')
        
        user = User.objects.create(
            email = validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        user_profile = UserProfile.objects.create(
            user=user,
            **profile_data
        )
        
        UserDatetime.objects.create(
            user = user_profile,
            description = "ACCOUNT CREATED"
        )
        
        return user



class ScheduleSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = Schedule
        fields = ['days', 'start_time', 'end_time', 'name', 'id']

    def get_name(self, obj):
        return str(obj)



class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'module', 'branch', 'name', 'schedule', 
            'start_enroll', 'start_course', 'end_course', 
            'capacity', 'min_capacity', 'courseLink', 
            'teacher', 'googleCourseID', 'googleCourseCode', 'status'
        ]
       


class GetCourseSerializer(CourseSerializer):
    curr_enrolled = serializers.SerializerMethodField()
    module_name = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    start_enroll = serializers.SerializerMethodField()
    start_course = serializers.SerializerMethodField()
    end_course = serializers.SerializerMethodField()
    schedule = ScheduleSerializer()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['curr_enrolled', 'module_name', 'branch_name', 'teacher_name', 'start_enroll', 'start_course', 'end_course']

    def get_curr_enrolled(self, obj):
        curr_enrolled = StudentCourse.objects.filter(course=obj).count()
        return curr_enrolled

    def get_module_name(self, obj):
        return str(obj.module) if obj.module else None

    def get_branch_name(self, obj):
        return str(obj.branch) if obj.branch else None

    def get_teacher_name(self, obj):
        return str(obj.teacher) if obj.teacher else None
    
    def get_start_enroll(self, obj):
        return obj.start_enroll.strftime("%m/%d/%Y %H:%M") if obj.start_course else None
    
    def get_start_course(self, obj):
        return obj.start_course.strftime("%m/%d/%Y %H:%M") if obj.start_course else None

    def get_end_course(self, obj):
        return obj.end_course.strftime("%m/%d/%Y %H:%M") if obj.start_course else None



class GetCourseAuditSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    grade = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    module = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentCourse
        fields = ['name', 'grade', 'status', 'finishDatetime', 'module']

    def get_name(self, obj):
        if isinstance(obj, Module):
            return obj.name
        else:
            return f"{obj.course.module} {obj.course.name}" if obj.course.module and obj.course.name else None

    def get_grade(self, obj):
        # Grade is only available for enrolled students
        return obj.grade if isinstance(obj, StudentCourse) and obj.grade else "N/A"
    
    def get_status(self, obj):
        if isinstance(obj, Module):
            return "Not yet taken"
        else:
            gs = Module.objects.filter(id=obj.course.module.id).first().module_gradetype
            result = Grade.objects.filter(value=obj.grade, type=gs).first()
            
            if result: return "Passed" if result.credit else "Failed"
            else: return "Ongoing"
            
    def get_finishDatetime(self, obj):
        if isinstance(obj, Module):
            return "Not yet taken"
        else:
            return obj.finishDatetime if isinstance(obj, StudentCourse) and obj.finishDatetime else "N/A"
        
    def get_module(self, obj):
        return obj.course.module.id if isinstance(obj, StudentCourse) else obj.id



class GetStudentCourseSerializer(serializers.ModelSerializer):
    student = BasicUserProfileSerializer()
    course = CourseSerializer()
    module_name = serializers.SerializerMethodField()
    class Meta:
        model = StudentCourse
        fields = ['student', 'course','module_name', 'grade']

    def get_module_name(self, obj):
        return str(obj.course.module) if obj.course.module else None



class StudentEnrollmentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    studentid = serializers.CharField(source='user.studentid', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    current_modules = serializers.SerializerMethodField()
    program_modules = serializers.SerializerMethodField()
    program_id = serializers.IntegerField(source='program.id', read_only=True)  # Add this line
    program_name = serializers.CharField(source='program.name', read_only=True)  # Program Name
    details = serializers.JSONField()
    average_percentage = serializers.SerializerMethodField()
    graduation_date = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['name', 'studentid', 'email', 'current_modules', 'program_modules', 'program_id', 'program_name', 'details', 'user_id', 'branch_name', 'average_percentage', 'status', 'graduation_date']

    def get_name(self, obj):
        return str(obj)

    def get_current_modules(self, obj):
        current_courses = StudentCourse.objects.filter(student=obj, grade__isnull=True)
        return [f"{current_course.course.module.name} {current_course.course.name}" for current_course in current_courses]
        
    def get_program_modules(self, obj):
        program_modules_query = ProgramModules.objects.filter(program=obj.program)
        program_modules = []
    
        total_percentage = 0
        count = 0

        for prog_mod in program_modules_query:
            student_course = StudentCourse.objects.filter(student=obj, course__module=prog_mod.module).exclude(status="DROPPED").first()
        
            module_gradetype_id = prog_mod.module.module_gradetype_id  # Get grade system ID
            grade_system = "4.0 Scale" if module_gradetype_id == 1 else "1.0 Scale" if module_gradetype_id == 2 else "Unknown"

            grade_value = None
            if student_course and student_course.grade:
                grade_value = float(student_course.grade)
                # Convert grade to percentage
                if module_gradetype_id == 1:  # 4.0 Scale
                    percentage = (grade_value / 4.0) * 100
                elif module_gradetype_id == 2:  # 1.0-5.0 Scale
                    percentage = 100 - ((grade_value - 1.0) / 4.0 * 100)
                else:
                    percentage = None

                if percentage is not None:
                    total_percentage += percentage
                    count += 1

            program_modules.append({
                "module": prog_mod.module.name,
                "course": student_course.course.name if student_course else None,
                "grade": student_course.grade if student_course else "In Progress",
                "grade_system": grade_system
            })
        # Calculate Average Percentage
        average_percentage = (total_percentage / count) if count > 0 else None


        # Convert back to 4.0 and 1.0-5.0 scales
      #  final_grade_4_0 = (average_percentage / 100) * 4.0 if average_percentage is not None else None
      #  final_grade_1_0_5_0 = 1.0 + ((100 - average_percentage) / 100 * 4.0) if average_percentage is not None else None

        return program_modules


    def get_average_percentage(self, obj):
        program_modules = self.get_program_modules(obj)  
        total_percentage = 0
        count = 0

        for module in program_modules:
            if "grade" in module:
                grade = module["grade"]

            # Skip 'In Progress' or None grades
                if grade == "In Progress" or grade is None:
                    continue

            # Convert grade to float if it is a valid numeric grade
                try:
                    grade_value = float(grade)
                except ValueError:
                    continue  # Skip invalid grades

                grade_system = module["grade_system"]

                if grade_system == "4.0 Scale":
                    percentage = (grade_value / 4.0) * 100
                elif grade_system == "1.0 Scale":
                    percentage = 100 - ((grade_value - 1) * 25)
                else:
                    continue  # Skip unknown grade systems

                total_percentage += percentage
                count += 1

    # Calculate and return the average percentage
        average_percentage = (total_percentage / count) if count > 0 else None

    # Return the average percentage formatted to 2 decimal places
        return f"{average_percentage:.2f}" if average_percentage is not None else None


    def get_graduation_date(self, obj):
        latest_course = StudentCourse.objects.filter(
            student=obj,
            finishDatetime__isnull=False
        ).aggregate(latest_finish=Max("finishDatetime"))

        graduation_date = latest_course["latest_finish"]
        return graduation_date.strftime("%Y-%m-%d") if graduation_date and obj.status == "COMPLETE" else "N/A"

        

class ReportProgramSerializer(serializers.ModelSerializer):
    enrolled_students = serializers.IntegerField(read_only=True)  # Add this line
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    modules = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    average_grades = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = '__all__'
        
    def get_modules(self, obj):
    # Fetch related modules through the ProgramModules model
        program_modules = ProgramModules.objects.filter(program=obj)
        return ModuleSerializer([pm.module for pm in program_modules], many=True).data
    
    def get_price(self, obj):
        program_modules = ProgramModules.objects.filter(program=obj)
        total_price = 0
        for pm in program_modules:
            total_price += pm.module.price
        return total_price
    
    def get_average_grades(self, obj):
        request = self.context.get('request')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Convert string dates to datetime
        try:
            if start_date is not None:
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
            if end_date is not None:
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return {}  # Return empty if dates are invalid

        program_modules = ProgramModules.objects.filter(program=obj).values_list('module_id', flat=True)

        avg_grades = (
            StudentCourse.objects
            .filter(course__module_id__in=program_modules)
            .exclude(grade__isnull=True)  # Ignore null grades
        )

        # Apply date range filter if both dates are provided
        if start_date and end_date:
            avg_grades = avg_grades.filter(enrollDatetime__range=[start_date, end_date])
        
        avg_grades = (
            avg_grades.values("course__module__name")
            .annotate(avg_grade=Avg("grade"))
            .order_by("course__module__name")
        )

        return {item["course__module__name"]: item["avg_grade"] for item in avg_grades}

class CreateStudentCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentCourse
        fields = ['student', 'course']


class DropEnrollmentSerializer(CreateStudentCourseSerializer):
    class Meta(CreateStudentCourseSerializer.Meta):
        fields = CreateStudentCourseSerializer.Meta.fields + ['status']




class FinishStudentCourseSerializer(CreateStudentCourseSerializer):
    
    class Meta(CreateStudentCourseSerializer.Meta):
        fields = CreateStudentCourseSerializer.Meta.fields + ['finishDatetime', 'grade']



# class EnrollFinishStudentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StudentCourse
#         fields = ['student']
    
#     def update(self, instance, validated_data):
#         instance.finishDatetime = datetime.now()
#         instance.save()
#         return instance
        


class UpdateUserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user_id', 'lastName', 'firstName', 'middleName', 'extensions', 'details']
        
    def update(self, instance, validated_data):
        instance.lastName = validated_data.get('lastName', instance.lastName)
        instance.firstName = validated_data.get('firstName', instance.firstName)
        instance.middleName = validated_data.get('middleName', instance.middleName)
        instance.extensions = validated_data.get('extensions', instance.extensions)
        instance.details = validated_data.get('details', instance.details)
        
        instance.save()
        
        return instance



class UpdateStudentSerializer(UpdateUserProfileSerializer):
    class Meta(UpdateUserProfileSerializer.Meta):
        fields = UpdateUserProfileSerializer.Meta.fields

    def update(self, instance, validated_data):
        instance.details = validated_data.get('details', instance.details)
        
        birthCert = instance.details.pop('birthCert', None)
        birthCertName = instance.details.pop('birthCertName', None)
        proof_of_payment = instance.details.pop('proof_of_payment', None)
        proof_of_paymentName = instance.details.pop('proof_of_paymentName', None)
        
        if birthCert:
            name = 'birthCert'
            fileData = birthCert
            
            existing_record = File.objects.filter(user=instance, type=name).first()
            
            if existing_record:
                existing_record.file_data = fileData
                existing_record.file_name = birthCertName
                existing_record.save()
            else:
                File.objects.create(user=instance, type=name, file_name=birthCertName, file_data=fileData)
        
        if proof_of_payment:
            name = 'proof_of_payment'
            fileData = proof_of_payment
            
            existing_record = File.objects.filter(user=instance, type=name).first()
            
            if existing_record:
                existing_record.file_data = fileData
                existing_record.file_name = birthCertName
                existing_record.save()
            else:
                File.objects.create(user=instance, type=name, file_name=proof_of_paymentName, file_data=fileData)
        
        instance.save()
        return instance
        



class UpdateUserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['status']
        
    def validate_status(self, value):
        valid_statuses = dict(UserProfile.STATUS_CHOICES).keys()
        if value not in valid_statuses:
            raise serializers.ValidationError("Invalid status. Please provide a valid status.")
        return value



class UpdateUserCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['details']



class AnnouncementSerializer(serializers.ModelSerializer):
    poster_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcements
        fields = ['id', 'title', 'subtitle', 'content', 'link', 'linkname', 'imglink', 'datetime', 'postedBy', 'status', 'branch', 'poster_name']
        
    def get_poster_name(self, obj):
        return str(obj.postedBy)
    
    def create(self, validated_data):
        announcement = Announcements.objects.create(
            title = validated_data['title'],
            subtitle = validated_data['subtitle'],
            content = validated_data['content'],
            link = validated_data['link'],
            linkname = validated_data['linkname'],
            imglink = validated_data['imglink'],
            postedBy = validated_data['postedBy'],
            branch = validated_data['branch']
        )
        announcement.save()
        return announcement
    
    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.subtitle = validated_data.get('subtitle', instance.subtitle)
        instance.content = validated_data.get('content', instance.content)
        instance.link = validated_data.get('link', instance.link)
        instance.linkname = validated_data.get('linkname', instance.linkname)
        instance.imglink = validated_data.get('imglink', instance.imglink)
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance

class ModuleSerializer(serializers.ModelSerializer):  
    module_gradetype = serializers.PrimaryKeyRelatedField(queryset=GradeSystem.objects.all()) 
    class Meta:
        model = Module
        fields = '__all__'



class GetCoursesFacultySerializer(CourseSerializer):
    module = ModuleSerializer()
    class Meta:
        model = CourseSerializer.Meta.model
        fields = CourseSerializer.Meta.fields



class ProgramSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = '__all__'

    def get_modules(self, obj):
        # Fetch related modules through the ProgramModules model
        program_modules = ProgramModules.objects.filter(program=obj)
        return ModuleSerializer([pm.module for pm in program_modules], many=True).data


class ProgramModulesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramModules
        fields = '__all__'






class GradeSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeSystem
        fields = '__all__'


        
        
# For getting modules
class ModuleViewSerializer(serializers.ModelSerializer):
    module_gradetype = GradeSystemSerializer(read_only=True)  
    class Meta:
        model = Module
        fields = '__all__'




class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = '__all__'
        
        

# class ScheduleSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Schedule
#         fields = '__all__'


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'


class AssignTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'teacher']  # Only need to update the teacher field

    def update(self, instance, validated_data):
        instance.teacher = validated_data.get('teacher', instance.teacher)
        instance.save()
        return instance



class DissolveCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'status']  # Only need to update the status field

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance



class StudentCourseSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = StudentCourse
        fields = ['id', 'student', 'name', 'grade', 'finishDatetime']
    
    def get_name(self, obj):
        return str(obj.student)  # Uses __str__ method from UserProfile

class ArchiveAnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcements
        fields = ["status"]  # Only allow updating the status field


class CourseWithStudentsSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    module_name = serializers.CharField(source='module.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'module_name', 'name', 'status', 'start_enroll', 'start_course', 'end_course', 'students', 'branch_name']
    
    def get_students(self, obj):
        students = StudentCourse.objects.filter(course=obj).exclude(status="DROPPED")
        return StudentCourseSerializer(students, many=True).data
    

class MatchingLogSerializer(serializers.ModelSerializer):
    student = serializers.IntegerField(source='student.user_id')  # Map student to user_id
    class Meta:
        model = MatchingLog
        fields = ["matching_id", "student", "date_generated", "generated_by"]