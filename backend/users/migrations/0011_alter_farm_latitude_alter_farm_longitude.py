# Generated by Django 4.2.4 on 2023-10-01 17:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0010_remove_croprotation_season_croprotation_seasons_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="farm",
            name="latitude",
            field=models.DecimalField(decimal_places=30, max_digits=30),
        ),
        migrations.AlterField(
            model_name="farm",
            name="longitude",
            field=models.DecimalField(decimal_places=30, max_digits=30),
        ),
    ]