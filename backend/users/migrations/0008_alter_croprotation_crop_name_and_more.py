# Generated by Django 4.2.4 on 2023-09-30 05:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_croprotation"),
    ]

    operations = [
        migrations.AlterField(
            model_name="croprotation",
            name="crop_name",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="croprotation",
            name="crop_variety",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name="croprotation",
            name="harvesting_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="croprotation",
            name="planting_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
