# Generated by Django 4.2.4 on 2023-09-30 05:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0006_rename_season_name_season_season_name_season_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="CropRotation",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("crop_name", models.CharField(max_length=255)),
                ("planting_date", models.DateField()),
                ("harvesting_date", models.DateField()),
                ("crop_variety", models.CharField(max_length=255)),
                (
                    "field",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="users.field"
                    ),
                ),
                (
                    "season",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="users.season"
                    ),
                ),
            ],
        ),
    ]
