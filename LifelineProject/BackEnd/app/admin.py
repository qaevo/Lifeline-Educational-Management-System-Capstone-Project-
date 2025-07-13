from django.contrib import admin
from .models import *

admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(Program)
admin.site.register(ProgramModules)
admin.site.register(Module)
admin.site.register(GradeSystem)
admin.site.register(Grade)
admin.site.register(Course)
admin.site.register(StudentCourse)
admin.site.register(Branch)
admin.site.register(File)
admin.site.register(Announcements)
admin.site.register(Report)