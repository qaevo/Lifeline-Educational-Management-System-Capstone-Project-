from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# Create your models here.

class User(AbstractUser):
    studentid = models.CharField(max_length=16, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True)
    username = None
    last_login = None
    first_name = None
    last_name = None
    date_joined = None
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['userid', 'username']
    
    def __str__(self):
        return str(self.email)
    
    pass


class UserProfile(models.Model):
    ROLE_CHOICES = (
        (PRE_STUDENT := "PRE-STUDENT", "Pre-Student"),
        (STUDENT := "STUDENT", "Student"),
        (FACULTY := "FACULTY", "Faculty"),
        (CASHIER := "CASHIER", "Cashier"),
        (BRANCH_MANAGER := "BRANCH_MANAGER", "Branch Manager"),
        (ADMIN := "ADMIN", "Admin"),
        (SUPERVISOR := "SUPERVISOR", "Supervisor"),
    )
    
    STATUS_CHOICES = (
        (NEW := "NEW", "New"),
        (PARTIALLY_PAID := "PARTIALLY_PAID", "Partially Paid"),
        (ON_HOLD := "ON_HOLD", "On Hold"),
        (CONFIRMED := "CONFIRMED", "Confirmed"),
        (ONGOING := "ONGOING", "Ongoing"),
        (COMPLETE := "COMPLETE", "Complete"),
        (AWOL := "AWOL", "AWOL"),
        (EMPLOYED := "EMPLOYED", "Employed"),
        (RESIGNED := "RESIGNED", "Resigned")
    )
    
    user = models.OneToOneField(User, on_delete=models.RESTRICT)
    role = models.CharField(choices=ROLE_CHOICES, max_length=14)
    status = models.CharField(choices=STATUS_CHOICES, max_length=14, default="NEW")
    program = models.ForeignKey("Program", on_delete=models.PROTECT, null=True, blank=True)
    branch = models.ForeignKey("Branch", on_delete=models.PROTECT)
    lastName = models.CharField(max_length=45)
    firstName = models.CharField(max_length=75)
    middleName = models.CharField(max_length=45, null=True, blank=True)
    extensions = models.CharField(max_length=5, null=True, blank=True)
    details = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        parts = [self.firstName, self.middleName, self.lastName, self.extensions]
        full_name_parts = [part for part in parts if part]
        return ' '.join(full_name_parts)


class UserDatetime (models.Model):
    user = models.ForeignKey("UserProfile", on_delete=models.CASCADE)
    description = models.CharField(max_length=20)
    datetime = models.DateTimeField(auto_now_add=True)



class Program (models.Model):
    name = models.CharField(max_length=100)
    branch = models.ForeignKey("Branch", on_delete=models.PROTECT)
    
    def __str__(self):
        return self.name



class ProgramModules (models.Model):
    program = models.ForeignKey("Program", on_delete=models.PROTECT)
    module = models.ForeignKey("Module", on_delete=models.PROTECT)
    
    class Meta:
        unique_together = (("program", "module"),)

    def __str__(self):
        return f"{self.program} | {self.module}"



class Module (models.Model):
    name = models.CharField(max_length=100,  unique=True)
    price = models.FloatField(null=True, blank=True)
    module_gradetype = models.ForeignKey("GradeSystem", on_delete=models.PROTECT)
    description = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.name
    


class GradeSystem (models.Model):
    description = models.CharField(max_length=10)
    
    def __str__(self):
        return self.description



class Grade (models.Model):
    type = models.ForeignKey("GradeSystem", on_delete=models.PROTECT)
    value = models.CharField(max_length=4)
    description = models.CharField(max_length=20)
    credit = models.BooleanField()
    
    def __str__(self):
        return f'{self.value} of {self.type} ({self.description})'



class Course(models.Model):
    STATUS_CHOICES = (
        (ACTIVE := "ACTIVE", "Active"),
        (DISSOLVED := "DISSOLVED", "Dissolved")
    )
    
    module = models.ForeignKey("Module", on_delete=models.PROTECT)
    branch = models.ForeignKey("Branch", on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    schedule = models.ForeignKey("Schedule", on_delete=models.PROTECT)
    start_enroll = models.DateTimeField(null=True, blank=True)
    start_course = models.DateTimeField(null=True, blank=True)
    end_course = models.DateTimeField(null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)
    min_capacity = models.IntegerField(default=8)
    courseLink = models.CharField(max_length=255, null=True, blank=True)
    teacher = models.ForeignKey("UserProfile", on_delete=models.PROTECT, null=True, blank=True)
    googleCourseID = models.CharField(max_length=100, null=True, blank=True)
    googleCourseCode = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=10, default="ACTIVE")
    
    def __str__(self):
        return f"{self.branch.name} | {self.module.name} {self.name}"



class StudentCourse (models.Model):
    STATUS_CHOICES = (
        (PAID := "PAID", "Paid"),
        (PENDING := "PENDING", "Pending"),
        (DROPPED := "DROPPED", "Dropped")
    )
    
    student = models.ForeignKey("UserProfile", on_delete=models.PROTECT)
    course = models.ForeignKey("Course", on_delete=models.PROTECT)
    enrollDatetime = models.DateTimeField(auto_now_add=True)
    grade = models.CharField(max_length=4, null=True, blank=True)
    finishDatetime = models.DateTimeField(null=True, blank=True)
    status = models.CharField(choices=STATUS_CHOICES, max_length=7, default=PENDING)
    
    def __str__(self):
        return f"{self.course.__str__()} | {self.student.__str__()} ({self.status})"
    


class Branch (models.Model):
    name = models.CharField(max_length=17)
    description = models.CharField(max_length=100, null=True, blank=True)
    
    def __str__(self):
        return self.name



class File (models.Model):
    user = models.ForeignKey("UserProfile", on_delete=models.PROTECT)
    type = models.CharField(max_length=255)
    file_name = models.CharField(max_length=255, null=True, blank=True)
    file_data = models.TextField()
    datetime = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user}\\{self.name}"
    
    

class Announcements (models.Model):
    STATUS_CHOICES = (
        (POSTED := "POSTED", "Posted"),
        (ARCHIVED := "ARCHIVED", "Archived")
    )
    
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=100, null=True, blank=True)
    content = models.TextField()
    link = models.CharField(max_length=350, null=True, blank=True)
    linkname = models.CharField(max_length=50, null=True, blank=True)
    imglink = models.CharField(max_length=350, null=True, blank=True)
    datetime = models.DateTimeField(auto_now_add=True)
    postedBy = models.ForeignKey("UserProfile", on_delete=models.PROTECT)
    status = models.CharField(choices=STATUS_CHOICES, max_length=9, default=POSTED)
    branch = models.ForeignKey("Branch", on_delete=models.PROTECT, default=999)
    
    def __str__(self):
        return self.title
    
    
class Schedule(models.Model):
    DAYS_OF_WEEK = [
        ('Sunday', 'Sunday'),
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    ]

    days = models.JSONField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        weekends = ['Sunday', 'Saturday']
        
        if set(weekdays) == set(self.days) and len(weekdays) == len(self.days): return f"Weekdays ({self.start_time} - {self.end_time})"
        if set(weekends) == set(self.days) and len(weekends) == len(self.days): return f"Weekends ({self.start_time} - {self.end_time})"
        return f"{', '.join(self.days)} ({self.start_time} - {self.end_time})"

class Report(models.Model):
    reportID = models.AutoField(primary_key=True)
    date_generated = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey("UserProfile", on_delete=models.CASCADE)
    report_type = models.CharField(max_length=100, default="general")  # Default value

    def __str__(self):
        return f"Report {self.reportID} by {self.generated_by}"




class MatchingLog(models.Model):
    matching_id = models.IntegerField()  # Integer-based matching_id for grouping
    date_generated = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matching_logs')
    student = models.ForeignKey("UserProfile", on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.matching_id} - {self.student.username}"