import json


class Backup:
    def __init__(
        self,
        backup_id: str,
        created: str,
        course: str,
        assignment: str,
        student_email: str,
        is_late: bool,
        submitted: bool,
        autograder_output_location: str = None,
        grading_location: str = None,
        file_contents_location: str = None,
        analytics_location: str = None,
        scoring_location: str = None,
        unlock_location: str = None,
    ):
        self.backup_id = backup_id
        self.created = created
        self.course = course
        self.assignment = assignment
        self.student_email = student_email

        self.is_late = is_late
        self.submitted = submitted

        self.autograder_output_location = autograder_output_location
        self.grading_location = grading_location
        self.file_contents_location = file_contents_location
        self.analytics_location = analytics_location
        self.scoring_location = scoring_location
        self.unlock_location = unlock_location


class OkPyMessage:
    def __init__(self, contents):
        self.contents = contents


class AutograderOutputMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}/autograder_output.txt"

    def write(self, directory):
        with open(AutograderOutputMessage.location(directory), "w") as f:
            f.write(self.contents)


class GradingMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}/grading.json"

    def write(self, directory):
        with open(GradingMessage.location(directory), "w") as f:
            json.dump(self.contents, f, indent=2)


class FileContentsMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        # NOTE: a file content message's location is a DIRECTORY rather than a file
        # since there may be multiple source files in a student's backup
        return directory

    def write(self, directory):
        for src_file_name, src_file_contents in self.contents.items():
            with open(
                f"{FileContentsMessage.location(directory)}/{src_file_name}", "w"
            ) as f:
                f.write(str(src_file_contents))


class AnalyticsMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}/analytics.json"

    def write(self, directory):
        with open(AnalyticsMessage.location(directory), "w") as f:
            json.dump(self.contents, f, indent=2)


class ScoringMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}/scoring.json"

    def write(self, directory):
        with open(ScoringMessage.location(directory), "w") as f:
            json.dump(self.contents, f, indent=2)


class UnlockMessage(OkPyMessage):
    @staticmethod
    def location(directory):
        return f"{directory}/unlock.json"

    def write(self, directory):
        with open(UnlockMessage.location(directory), "w") as f:
            json.dump(self.contents, f, indent=2)


MESSAGE_KIND_TO_CLASS = {
    "autograder_output": AutograderOutputMessage,
    "grading": GradingMessage,
    "file_contents": FileContentsMessage,
    "analytics": AnalyticsMessage,
    "scoring": ScoringMessage,
    "unlock": UnlockMessage,
}


class LintError:
    def __init__(
        self,
        file_contents_location: str,
        line_number: int,
        message: str,
        code: str,
        url: str | None = None,
    ):
        self.file_contents_location = file_contents_location
        self.line_number = line_number
        self.message = message
        self.code = code
        self.url = url


class BackupFileMetadata:
    def __init__(self, file_contents_location: str, file_name: str, num_lines: int):
        self.file_contents_location = file_contents_location
        self.file_name = file_name
        self.num_lines = num_lines
